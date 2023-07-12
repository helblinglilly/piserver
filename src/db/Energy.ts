import {
	decimal,
	pgEnum,
	pgTable,
	primaryKey,
	timestamp,
} from "drizzle-orm/pg-core";
import PoolFactory from "./poolFactory";
import { desc, eq } from "drizzle-orm";

export const energyTypeEnum = pgEnum("energy_type", ["electricity", "gas"]);

export const EnergyUsage = pgTable(
	"energy_usage",
	{
		energyType: energyTypeEnum("type").notNull(),
		kWh: decimal("kwh").notNull(),
		startDate: timestamp("start_date").notNull(),
		endDate: timestamp("end_date").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
	},
	(table) => {
		return {
			pk: primaryKey(table.energyType, table.startDate, table.endDate),
		};
	}
);

const db = PoolFactory();

export interface EnergyUsageRow {
	energyType: "electricity" | "gas";
	kWh: number;
	startDate: Date;
	endDate: Date;
}

export async function insertEnergyUsage(values: EnergyUsageRow[]) {
	await db.transaction(async (db) => {
		await db
			.insert(EnergyUsage)
			.values(
				values.map((value) => ({
					energyType: value.energyType,
					kWh: value.kWh.toString(),
					startDate: value.startDate,
					endDate: value.endDate,
					createdAt: new Date(),
				}))
			)
			.onConflictDoNothing();
	});
}

export async function getLatestUsageEndDate(
	energyType: "electricity" | "gas"
): Promise<Date> {
	const result = await db
		.select({ endDate: EnergyUsage.endDate })
		.from(EnergyUsage)
		.where(eq(EnergyUsage.energyType, energyType))
		.orderBy(desc(EnergyUsage.endDate))
		.limit(1);
	if (result.length === 0) {
		if (!process.env.MOVE_IN_DATE) throw new Error("MOVE_IN_DATE not set");

		const defaultDate = new Date(process.env.MOVE_IN_DATE);
		defaultDate.setHours(0);
		defaultDate.setMinutes(0);
		defaultDate.setSeconds(0);
		defaultDate.setMilliseconds(0);
		return defaultDate;
	}
	return new Date(result[0].endDate);
}
