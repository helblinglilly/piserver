import { date, decimal, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { energyTypeEnum } from "./EnergyUsage";
import PoolFactory from "./poolFactory";
import { and, desc, eq } from "drizzle-orm";
import { openEnergyDb } from "./db";


interface IEnergyBillRow {
    energy_type: 'electricity' | 'gas',
    start_date: string,
    end_date: string,
    usage: number | null,
    usage_rate: number | null,
    standing_charge: number | null,
    cost: number | null,
    charged: number | null
}

export interface EnergyBill {
	energyType: "electricity" | "gas";
	startDate: string;
	endDate: string;
	usage: number;
	usageRate: number;
	standingCharge: number;
	cost: number;
	charged: number;
}

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


function getDateString(date: Date | string){
    return new Date(date).toISOString().split('T')[0];
}

export async function insertEnergyBill(
	gas: EnergyBill,
	electricity: EnergyBill,
) {
    const db = await openEnergyDb();

    try {
        await db.run(`INSERT INTO energy_bills 
            (energy_type, start_date, end_date, usage, usage_rate, standing_charge, cost, charged)
            VALUES
            ('gas', $gas_start, $gas_end, $gas_usage, $gas_usage_rate, $gas_standing_charge, $gas_cost, $gas_charged),
            ('electricity, $elec_start, $elec_end, $elec_usage, $elec_usage_rate, $elec_standing_charge, $elec_cost, $elec_charged)`,{
                $gas_start: getDateString(gas.startDate),
                $gas_end: getDateString(gas.endDate),
                $gas_usage: gas.usage,
                $gas_usage_rate: gas.usageRate,
                $gas_cost: gas.cost,
                $gas_charged: gas.charged,
                $elec_start: getDateString(electricity.startDate),
                $elec_end: getDateString(electricity.endDate),
                $elec_usage: electricity.usage,
                $elec_usage_rate: electricity.usageRate,
                $elec_cost: electricity.cost,
                $elec_charged: electricity.charged
            })
    } catch(err){
        console.log(`Failed to insert into DB with data`, gas, electricity, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function updateEnergyBill(
	startDate: Date,
	endDate: Date,
	newBills: { gas: EnergyBill; electricity: EnergyBill },
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

export async function getAllBills(): Promise<EnergyBill[]> {
    const db = await openEnergyDb();

    try {
        return db.all(`SELECT energy_type, start_date, end_date, usage, usage_rate, standing_charge, cost, charged FROM energy_bills`)
        .then((rows: Array<IEnergyBillRow>) => {
            return rows.map((row) => {
                return {
                    energyType: row.energy_type,
                    startDate: new Date(row.start_date).toISOString(),
                    endDate: new Date(row.end_date).toISOString(),
                    usage: row.usage ?? 0,
                    usageRate: row.usage_rate ?? 0,
                    standingCharge: row.standing_charge ?? 0,
                    cost: row.cost ?? 0,
                    charged: row.charged ?? 0
                }

            })
        });
    } catch(err){
        console.log(`Failed to select from DB with data`, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
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
