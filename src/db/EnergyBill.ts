import { date, decimal, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { energyTypeEnum } from "./EnergyUsage";
import PoolFactory from "./poolFactory";
import { and, desc, eq } from "drizzle-orm";

export const EnergyBills = pgTable(
	"energy_bills",
	{
		energyType: energyTypeEnum("type").notNull(),
		startDate: date("start_date", { mode: "date" }).notNull(),
		endDate: date("end_date", { mode: "date" }).notNull(),
		usage: decimal("usage").notNull(),
		usageRate: decimal("usage_rate").notNull(),
		standingCharge: decimal("standing_charge").notNull(),
		cost: decimal("cost").notNull(),
		charged: decimal("charged").notNull(),
	},
	(table) => {
		return {
			pk: primaryKey(table.energyType, table.startDate),
		};
	},
);

const db = PoolFactory();

export interface EnergyBillRow {
	energyType: "electricity" | "gas";
	startDate: Date;
	endDate: Date;
	usage: number;
	usageRate: number;
	standingCharge: number;
	cost: number;
	charged: number;
}

export async function insertEnergyBill(
	gas: EnergyBillRow,
	electricity: EnergyBillRow,
) {
	await db.transaction(async (transactionDb) => {
		await transactionDb
			.insert(EnergyBills)
			.values([
				{
					energyType: "gas",
					startDate: new Date(gas.startDate),
					endDate: new Date(gas.endDate),
					usage: Number(gas.usage).toString(),
					usageRate: Number(gas.usageRate).toString(),
					standingCharge: Number(gas.standingCharge).toString(),
					cost: Number(gas.cost).toString(),
					charged: Number(gas.charged).toString(),
				},
				{
					energyType: "electricity",
					startDate: new Date(electricity.startDate),
					endDate: new Date(electricity.endDate),
					usage: Number(electricity.usage).toString(),
					usageRate: Number(electricity.usageRate).toString(),
					standingCharge: Number(electricity.standingCharge).toString(),
					cost: Number(electricity.cost).toString(),
					charged: Number(electricity.charged).toString(),
				},
			])
			.onConflictDoNothing();
	});
}

export async function updateEnergyBill(
	startDate: Date,
	endDate: Date,
	newBills: { gas: EnergyBillRow; electricity: EnergyBillRow },
) {
	let electricityReturned: unknown[] | undefined;
	let gasReturned: unknown[] | undefined;

	await db.transaction(async (transactionDBb) => {
		electricityReturned = await transactionDBb
			.update(EnergyBills)
			.set({
				startDate: new Date(newBills.electricity.startDate),
				endDate: new Date(newBills.electricity.endDate),
				usage: Number(newBills.electricity.usage).toString(),
				usageRate: Number(newBills.electricity.usage).toString(),
				standingCharge: Number(newBills.electricity.standingCharge).toString(),
				cost: Number(newBills.electricity.cost).toString(),
				charged: Number(newBills.electricity.charged).toString(),
			})
			.where(
				and(
					eq(EnergyBills.energyType, "electricity"),
					eq(EnergyBills.startDate, new Date(startDate)),
					/*
						This should also include but there's an issue with it
						eq(EnergyBills.endDate, new Date(endDate)),
					 */
				),
			)
			.returning();

		gasReturned = await transactionDBb
			.update(EnergyBills)
			.set({
				startDate: new Date(newBills.gas.startDate),
				endDate: new Date(newBills.gas.endDate),
				usage: Number(newBills.gas.usage).toString(),
				usageRate: Number(newBills.gas.usage).toString(),
				standingCharge: Number(newBills.gas.standingCharge).toString(),
				cost: Number(newBills.gas.cost).toString(),
				charged: Number(newBills.gas.charged).toString(),
			})
			.where(
				and(
					eq(EnergyBills.energyType, "gas"),
					eq(EnergyBills.startDate, new Date(startDate)),
					/*
						This should also include but there's an issue with it
						eq(EnergyBills.endDate, new Date(endDate)),
					 */
				),
			)
			.returning();
	});
	return {
		electricity: electricityReturned,
		gas: gasReturned,
	};
}

export async function getAllBills() {
	const result = await db.select().from(EnergyBills);

	return result;
}

export async function getBillByDate(startDate: Date, endDate: Date) {
	const result = await db
		.select()
		.from(EnergyBills)
		.where(
			and(eq(EnergyBills.startDate, startDate), eq(EnergyBills.endDate, endDate)),
		);
	return result;
}

export async function getLatestBillEndDate() {
	const result = await db
		.select({ date: EnergyBills.endDate })
		.from(EnergyBills)
		.orderBy(desc(EnergyBills.endDate))
		.limit(1);
	const moveIndate = process.env.MOVE_IN_DATE
		? new Date(process.env.MOVE_IN_DATE)
		: new Date("2000-01-01");

	console.log(result, moveIndate);
	return result.length === 0 ? moveIndate : result[0].date;
}

export async function getStandingChargeRates(since?: Date) {
	if (!since) {
		const today = new Date();
		today.setFullYear(today.getFullYear() - 1);
		since = today;
	}

	const results = await db
		.select({
			standingCharge: EnergyBills.standingCharge,
			endDate: EnergyBills.endDate,
			type: EnergyBills.energyType,
		})
		.from(EnergyBills)
		.orderBy(EnergyBills.endDate);

	const parsedResults = results.map((entry) => {
		return {
			standingCharge: Number(entry.standingCharge),
			endDate: entry.endDate.toISOString(),
			type: entry.type,
		};
	});
	return parsedResults;
}
