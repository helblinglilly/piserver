import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
require("dotenv").config();

export default function PoolFactory() {
	if (!process.env.DATABASE_URL) {
		console.error("Missing DATABASE_URL environment variable");
		process.exit(1);
	}
	const client = postgres(process.env.DATABASE_URL);
	const db = drizzle(client);
	return db;
}
