const { Pool } = require("pg");

require("dotenv").config();
const environment = process.env.NODE_ENV || "dev";

module.exports = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: `${process.env.POSTGRES_DATABASE}_${environment}`,
  password: process.env.POSTGRES_PASSWORD,
});
