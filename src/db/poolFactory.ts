import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
require("dotenv").config();

let client: postgres.Sql<{}> | undefined;
let db: ReturnType<typeof drizzle>;

export default function PoolFactory() {
	if (!process.env.DATABASE_URL) {
		console.error("Missing DATABASE_URL environment variable");
	}
	if (!client) {
		client = postgres(
			process.env.DATABASE_URL ?? "postgresql://postgres@localhost/test_db",
		);
		db = drizzle(client);
	}
	return db;
}
