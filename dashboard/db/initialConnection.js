const { Client } = require("pg");
const env = require("../environment");

require("dotenv").config();

module.exports.initialise = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const dbClient = new Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: "postgres",
        password: process.env.POSTGRES_PASSWORD,
      });

      await dbClient.connect();
      const dbQuery = await dbClient.query(`SELECT FROM pg_database WHERE datname = $1`, [
        `${process.env.POSTGRES_DATABASE}_${env}`,
      ]);

      if (dbQuery.rows.length === 0) {
        await dbClient.query(`CREATE DATABASE ${process.env.POSTGRES_DATABASE}_${env}`);
      }
      await dbClient.end();
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};
