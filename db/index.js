const { Pool } = require("pg");
const dotenvPath = "~/.env";

require("dotenv").config({
  path: `${dotenvPath}`,
});

module.exports = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
});
