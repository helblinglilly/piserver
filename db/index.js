const { Pool } = require("pg");
require("dotenv").config({
  path: `${__dirname}/../.env`,
});

module.exports = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
});
