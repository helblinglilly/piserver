const { Pool } = require("pg");
const env = require("../environment");

require("dotenv").config();

module.exports = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: `${process.env.POSTGRES_DATABASE}_${env}`,
  password: process.env.POSTGRES_PASSWORD,
});
