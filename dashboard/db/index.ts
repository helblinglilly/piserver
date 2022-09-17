import { Pool } from "pg";
import env from "../environment";

import Seed from "../db/seed";
const seed = new Seed();
seed.usertable();

require("dotenv").config();

export default new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: `${process.env.POSTGRES_DATABASE}_${env}`,
  password: process.env.POSTGRES_PASSWORD,
});
