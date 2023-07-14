import { date, decimal, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { energyTypeEnum } from "./EnergyUsage";
import PoolFactory from "./poolFactory";
import { desc, eq } from "drizzle-orm";

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
  }, (table) => {
    return {
      pk: primaryKey(table.energyType, table.startDate),
    };
  }
)

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

export async function insertEnergyBill(gas: EnergyBillRow, electricity: EnergyBillRow) {
  console.log("GAS:", gas);
  await db.transaction(async (db) => {
    await db
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
        }]
      )
      .onConflictDoNothing();
  });
}

export async function getBillByDate(date: Date) {
  const result = await db
    .select()
    .from(EnergyBills)
    .where(eq(EnergyBills.startDate, date));
  return result;
}

export async function getLatestBillEndDate() {
  const result = await db.select({date: EnergyBills.endDate}).from(EnergyBills).orderBy(desc(EnergyBills.endDate)).limit(1);
  const moveIndate = process.env.MOVE_IN_DATE ? new Date(process.env.MOVE_IN_DATE) : new Date('2000-01-01');

  console.log(result, moveIndate);
  return result.length === 0 ? moveIndate : result[0].date;
}