const { Client } = require("pg");
const env = require("../environment");

require("dotenv").config();

OCTOPUS_ELECTRIC_MPAN = 2340313769017;
const requiredEnvVars = [
  "POSTGRES_USER",
  "POSTGRES_HOST",
  "POSTGRES_DATABASE",
  "POSTGRES_PASSWORD",
  "OCTOPUS_ACCOUNT_NUMBER",
  "OCTOPUS_API_KEY",
  "OCTOPUS_ELECTRIC_MPAN",
  "OCTOPUS_ELECTRIC_SERIAL",
  "OCTOPUS_GAS_MPRN",
  "OCTOPUS_GAS_SERIAL",
  "MOVE_IN_DATE",
  "ADDRESS_CODE",
];

module.exports.initialise = () => {
  return new Promise(async (resolve, reject) => {
    requiredEnvVars.forEach((variable) => {
      if (process.env[variable] === undefined) {
        console.log(`Missing environment variable ${variable}! Shutting down...`);
        process.exit(0);
      }
    });

    try {
      const dbClient = new Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: "postgres",
        password: process.env.POSTGRES_PASSWORD,
      });

      var types = require("pg").types;
      types.setTypeParser(1700, "text", parseFloat);

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
