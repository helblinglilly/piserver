import log from "loglevel";
import "../utils/log.utils";
import { Client } from "pg";
import env from "../environment";

require("dotenv").config();

class DBSetup {
  static getConnection = () => {
    try {
      return new Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: "postgres",
        password: process.env.POSTGRES_PASSWORD,
      });
    } catch {
      log.error("Failed to get initial connection to database");
      process.exit(1);
    }
  };

  static initialise = () => {
    return new Promise<void>((resolve, reject) => {
      const dbClient = this.getConnection();

      const types = require("pg").types;
      types.setTypeParser(1700, "text", parseFloat);

      dbClient.connect().then(() => {
        dbClient
          .query(`SELECT datname FROM pg_database;`)
          .then((result) => {
            let databaseExists = false;

            result.rows.forEach((entry) => {
              if (entry["datname"] === `${process.env.POSTGRES_DATABASE}_${env}`) {
                databaseExists = true;
              }
            });

            if (!databaseExists) {
              log.info(
                `Database ${process.env.POSTGRES_DATABASE}_${env} doesn't exist yet`,
              );
              dbClient
                .query(`CREATE DATABASE ${process.env.POSTGRES_DATABASE}_${env}`)
                .then(() => {
                  log.info(`Created database ${process.env.POSTGRES_DATABASE}_${env}`);
                  dbClient.end(() => {
                    resolve();
                  });
                })
                .catch((err) => {
                  dbClient.end(() => {
                    log.error(
                      `Error occurred when trying to create database ${process.env.POSTGRES_DATABASE}_${env}. ${err}`,
                    );
                    reject(err);
                  });
                });
            } else {
              dbClient.end(() => {
                resolve();
              });
            }
          })
          .catch((err) => {
            log.error(
              `Error when trying to read databases that exist on the server. ${err}`,
            );
            reject(err);
          });
      });
    });
  };
}

export default DBSetup;
