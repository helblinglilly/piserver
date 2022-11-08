import { getLogger } from "loglevel";
import "../utils/log.utils";
import db from "../db";
import format from "pg-format";
import DateUtils from "../utils/date.utils";
import {
  Bill,
  BillingPeriod,
  EnergyUsage,
  StandingChargeInfo,
} from "../types/energy.types";
import { TableNames } from "../types/common.types";
import { EnergyBillData } from "../db/seed";
const log = getLogger("energy.bill.model");

class EnergyBillModel {
  static insertBill = async (
    table: TableNames,
    start_date: Date,
    end_date: Date,
    standing_days: number,
    standing_rate: number,
    usage: number,
    rate: number,
    pre_tax: number,
    after_tax: number,
  ): Promise<boolean> => {
    if (table !== TableNames.electricity_bill && table !== TableNames.gas_bill) {
      log.error(`insertBill has been called with an invalid table: ${table}`);
      return false;
    }

    return await db
      .query(
        format(
          `
          INSERT INTO ${table}
          (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax)
          VALUES
          (%L, %L, %L, %L, %L, %L, %L, %L)`,
          start_date,
          end_date,
          standing_days,
          standing_rate,
          usage,
          rate,
          pre_tax,
          after_tax,
        ),
      )
      .then(() => true)
      .catch((err) => {
        log.error(
          `Insert into ${table} failed with values: start_date: ${start_date}, end_date: ${end_date}, standing_days: ${standing_days}, standing_rate: ${standing_rate}, usage: ${usage}, rate: ${rate}, pre_tax: ${pre_tax}, after_tax: ${after_tax}`,
          `With error message: ${err}`,
        );
        log.trace();
        return false;
      });
  };

  static selectBill = async (table: TableNames): Promise<Array<Bill>> => {
    if (table !== TableNames.electricity_bill && table !== TableNames.gas_bill) {
      log.error(`selectBill has been called with an invalid table: ${table}`);
      return [];
    }

    return await db
      .query(
        `
          SELECT 
            billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax 
          FROM ${table}
          ORDER BY billing_start
        `,
      )
      .then((result) => {
        const returned: Array<Bill> = [];
        result.rows.forEach((entry: Bill) => returned.push(entry));
        return returned;
      })
      .catch((err) => {
        log.error(`selectBill failed with error ${err}`);
        log.trace();
        process.exit(-1);
      });
  };

  static selectLatesetRateAndCharge = async (
    table: TableNames,
  ): Promise<StandingChargeInfo> => {
    if (table !== TableNames.electricity_bill && table !== TableNames.gas_bill) {
      log.error(
        `selectLatesetRateAndCharge has been called with an invalid table: ${table}`,
      );
      return {
        standing_order_rate: -1,
        rate_kwh: -1,
      };
    }

    return await db
      .query(
        `
        SELECT standing_order_rate, rate_kwh
        FROM ${table}
        ORDER BY billing_end DESC
        LIMIT 1
        `,
      )
      .then((result) => {
        if (result.rows.length === 0) {
          log.warn(`selectLatestRateAndCharge received 0 entries - returning -1 instead`);
          return {
            standing_order_rate: -1,
            rate_kwh: -1,
          };
        }
        return result.rows[0];
      })
      .catch((err) => {
        log.error(`selectLatestRateAndCharge failed with error ${err}`);
        log.trace();
      });
  };

  static selectBillingPeriodFromDate = async (
    snapshotDate: Date,
  ): Promise<BillingPeriod> => {
    return await db
      .query(
        format(
          `
          SELECT billing_start, billing_end 
          FROM electricity_bill
          WHERE billing_start <= %L::date
          AND billing_end >= %L::date
          ORDER BY billing_start
          LIMIT 1
          `,
          DateUtils.toLocaleISOString(snapshotDate),
          DateUtils.toLocaleISOString(snapshotDate),
        ),
      )
      .then(async (result) => {
        let start: Date;
        let end: Date;

        if (result.rowCount === 0) {
          const maxBillingEnd = await db.query(
            `SELECT MAX(billing_end) FROM electricity_bill`,
          );
          start = maxBillingEnd.rows[0].billing_end;
          end = new Date();
        } else {
          start = result.rows[0].billing_start;
          end = result.rows[0].billing_end;
        }

        return {
          start_date: start,
          end_date: end,
        };
      })
      .catch((err) => {
        log.error(`selectBillingPeriodFromDate failed with error ${err}`);
        log.trace();
        return {
          start_date: new Date(0),
          end_date: new Date(1),
        };
      });
  };

  static selectLatestBillDate = async (table: TableNames): Promise<Date> => {
    if (table !== TableNames.electricity_bill && table !== TableNames.gas_bill) {
      log.error(`selectLatestBillDate has been called with an invalid table: ${table}`);
      return new Date(0);
    }

    return await db
      .query(format(`SELECT MAX(billing_end) FROM ${table}`))
      .then((result) => {
        if (result.rows[0].max == null) {
          return new Date(process.env.MOVE_IN_DATE);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestBillDate failed with error ${err}`);
        log.trace();
        return new Date(0);
      });
  };

  static selectLatestBill = async (table: TableNames): Promise<EnergyBillData> => {
    if (table !== TableNames.electricity_bill && table !== TableNames.gas_bill) {
      log.error(`selectLatestBill has been called with an invalid table: ${table}`);
      return;
    }

    return await db
      .query(
        format(
          `
        SELECT billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax
        FROM ${table}
        ORDER BY billing_end DESC
        LIMIT 1;
      `,
        ),
      )
      .then((result) => {
        return result.rows[0];
      })
      .catch((err) => {
        log.error(`selectLatestBill failed with error ${err}`);
        log.trace();
      });
  };
}

export default EnergyBillModel;
