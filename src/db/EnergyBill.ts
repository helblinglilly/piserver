import { date, decimal, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { energyTypeEnum } from "./EnergyUsage";
import PoolFactory from "./poolFactory";
import { openEnergyBillsDb } from "./db";


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

function rowToBill(row: IEnergyBillRow){
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
}
const db = PoolFactory();


function getDateString(date: Date | string){
    return new Date(date).toISOString().split('T')[0];
}

export async function insertEnergyBill(
	gas: EnergyBill,
	electricity: EnergyBill,
) {
    const db = await openEnergyBillsDb();

    try {
        await db.run(`INSERT INTO energy_bills 
            (energy_type, start_date, end_date, usage, usage_rate, standing_charge, cost, charged)
            VALUES
            ('gas', $gas_start, $gas_end, $gas_usage, $gas_usage_rate, $gas_standing_charge, $gas_cost, $gas_charged),
            ('electricity', $elec_start, $elec_end, $elec_usage, $elec_usage_rate, $elec_standing_charge, $elec_cost, $elec_charged)`,{
                $gas_start: getDateString(gas.startDate),
                $gas_end: getDateString(gas.endDate),
                $gas_usage: gas.usage,
                $gas_usage_rate: gas.usageRate,
                $gas_cost: gas.cost,
				$gas_standing_charge: gas.standingCharge,
                $gas_charged: gas.charged,
                $elec_start: getDateString(electricity.startDate),
                $elec_end: getDateString(electricity.endDate),
                $elec_usage: electricity.usage,
                $elec_usage_rate: electricity.usageRate,
				$elec_standing_charge: electricity.standingCharge,
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
): Promise<{ gas: EnergyBill, electricity: EnergyBill}> {
    const db = await openEnergyBillsDb();


    const sql = `
            BEGIN TRANSACTION;

			UPDATE energy_bill
			SET 
				usage = ${newBills.gas.usage}
				usage_rate = ${newBills.gas.usageRate}
				standing_charge = ${newBills.gas.standingCharge}
				cost = ${newBills.gas.cost}
				charged = ${newBills.gas.charged}
			WHERE 
				energy_type = 'gas' 
				AND start_date = '${startDate}';
            
			UPDATE energy_bill
			SET 
				usage = ${newBills.electricity.usage}
				usage_rate = ${newBills.electricity.usageRate}
				standing_charge = ${newBills.electricity.standingCharge}
				cost = ${newBills.electricity.cost}
				charged = ${newBills.electricity.charged}
			WHERE 
				energy_type = 'electricity' 
				AND start_date = '${startDate}';

            COMMIT;
        `
    try {
        await db.exec(sql);
    } catch(err){
        await db.exec('ROLLBACK');
        console.log('Failed to override Timesheet breaks', err)
        await db.close();
        throw new Error('Failed to insert into Database')
    }

	const [gasRow, electricRow] = await Promise.all([
		db.get(`SELECT start_date, end_date, usage, usage_rate, standing_charge, cost, charged, energy_type
			FROM energy_bills
			WHERE start_date = $startDate
			AND energy_type = 'gas'`, { $startDate: startDate}) as Promise<IEnergyBillRow>,
		db.get(`SELECT start_date, end_date, usage, usage_rate, standing_charge, cost, charged, energy_type
			FROM energy_bills
			WHERE start_date = $startDate
			AND energy_type = 'electricity'`, { $startDate: startDate}) as Promise<IEnergyBillRow>
	]).finally(async () =>{
        await db.close();
	})

	return {
		electricity: rowToBill(electricRow),
		gas: rowToBill(gasRow)
	};
}

export async function getAllBills(): Promise<EnergyBill[]> {
    const db = await openEnergyBillsDb();

    try {
        return db.all(`SELECT energy_type, start_date, end_date, usage, usage_rate, standing_charge, cost, charged FROM energy_bills`)
        .then((rows: Array<IEnergyBillRow>) => {
            return rows.map((row) => rowToBill(row))
        });
    } catch(err){
        console.log(`Failed to select from DB with data`, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function getBillByDate(startDate: Date, endDate: Date) {
	const db = await openEnergyBillsDb();

    try {
        return db.all(`SELECT energy_type, start_date, end_date, usage, usage_rate, standing_charge, cost, charged 
			FROM energy_bills
			WHERE start_date = $startDate AND end_date = $endDate`, {
				$startDate: startDate,
				$endDate: endDate
			})
        .then((rows: Array<IEnergyBillRow>) => {
            return rows.map((row) => rowToBill(row))
        });
    } catch(err){
        console.log(`Failed to select from DB with data`, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}

export async function getLatestBillEndDate() {
	const db = await openEnergyBillsDb();

	const moveIndate = process.env.MOVE_IN_DATE
		? new Date(process.env.MOVE_IN_DATE)
		: new Date("2000-01-01");

	let dbDate: Date | Array<unknown> = new Date(moveIndate);

    try {
        dbDate = await db.all(`SELECT end_date 
			FROM energy_bills
			ORDER BY end_date DESC
			LIMIT 1
			`)
        .then((rows: Array<{end_date: string}>) => {
            return rows.map((row) => new Date(row.end_date))[0]
        });
    } catch(err){
        console.log(`Failed to select from DB with data`, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }

	return dbDate > moveIndate ? dbDate : moveIndate;
}

export async function getStandingChargeRates(since?: Date): Promise<{ standingCharge: number, endDate: string, type: 'gas' | 'electricity'}[]> {
	if (!since) {
		const today = new Date();
		today.setFullYear(today.getFullYear() - 1);
		since = today;
	}

	const db = await openEnergyBillsDb();


    try {
        return await db.all(`SELECT standing_charge, end_date, energy_type 
			FROM energy_bills
			ORDER BY end_date DESC
			`)
        .then((rows: Array<{standing_charge: number, end_date: string, energy_type: string}>) => {
            return rows.map((row) => {
				return {
					standingCharge: row.standing_charge,
					endDate: row.end_date,
					type: row.energy_type as 'gas' | 'electricity'
				}
			});
        });
    } catch(err){
        console.log(`Failed to select from DB with data`, err);
        throw new Error('Failed to insert into Database')
    } finally {
        await db.close();
    }
}
