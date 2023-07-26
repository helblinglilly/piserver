import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
require("dotenv").config();

var client: postgres.Sql<{}> | undefined;

export default function PoolFactory() {
	if (!process.env.DATABASE_URL) {
		console.error("Missing DATABASE_URL environment variable");
		process.exit(1);
	}
	if (!client) {
		client = postgres(process.env.DATABASE_URL);
	}
	const db = drizzle(client);
	return db;
}
