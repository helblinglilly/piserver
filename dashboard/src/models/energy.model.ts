import { getLogger } from "loglevel";
import "../utils/log.utils";
import db from "../db";
import format from "pg-format";
const log = getLogger("energy.model");

class EnergyModel {
  static insertElectricityBill = async (
    start_date: Date,
    end_date: Date,
    standing_days: number,
    standing_rate: number,
    usage: number,
    rate: number,
    pre_tax: number,
    after_tax: number,
  ) => {
    return await db
      .query(
        format(
          `INSERT INTO electricity_bill 
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
      .catch((err) => {
        log.error(
          `Insert into electricity bill failed with values: start_date: ${start_date}, end_date: ${end_date}, standing_days: ${standing_days}, standing_rate: ${standing_rate}, usage: ${usage}, rate: ${rate}, pre_tax: ${pre_tax}, after_tax: ${after_tax}`,
          `With error message: ${err}`,
        );
        log.trace();
      });
  };

  static insertGasBill = async (
    start_date: Date,
    end_date: Date,
    standing_days: number,
    standing_rate: number,
    usage: number,
    rate: number,
    pre_tax: number,
    after_tax: number,
  ) => {
    return await db
      .query(
        format(
          `INSERT INTO gas_bill 
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
      .catch((err) => {
        log.error(
          `Insert into gas bill failed with values: start_date: ${start_date}, end_date: ${end_date}, standing_days: ${standing_days}, standing_rate: ${standing_rate}, usage: ${usage}, rate: ${rate}, pre_tax: ${pre_tax}, after_tax: ${after_tax}`,
          `With error message: ${err}`,
        );
        log.trace();
      });
  };

  static selectEnergyBill = async () => {
    return await db
      .query(
        format(
          `SELECT billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax 
                FROM electricity_bill
                ORDER BY billing_start`,
        ),
      )
      .then((result) => {
        return result.rows;
      })
      .catch((err) => {
        log.error(`selectEnergyBill failed with error ${err}`);
        log.trace();
      });
  };

  static selectGasBill = async () => {
    return await db
      .query(
        format(
          `SELECT billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax 
                FROM gas_bill
                ORDER BY billing_start`,
        ),
      )
      .then((result) => {
        return result.rows;
      })
      .catch((err) => {
        log.error(`selectGasBill failed with error ${err}`);
        log.trace();
      });
  };

  static insertElectricityEntry = async (
    startDate: Date,
    endDate: Date,
    usage: number,
  ) => {
    const createdDate = new Date();
    return await db
      .query(
        format(
          `INSERT INTO electricity_usage
              (start_date, end_date, usage_kwh, entry_created)
              VALUES
              (%L, %L, %L, %L)`,
          startDate,
          endDate,
          usage,
          createdDate,
        ),
      )
      .catch(async (err1) => {
        log.warn(
          `insertElectricityEntry failed to insert with values start_date: ${startDate}, end_date: ${endDate}, usage: ${usage}kWh. Will try once more`,
        );

        return await db
          .query(
            format(
              `UPDATE electricity_usage 
                SET start_date=%L, end_date=%L, usage_kwh=%L, entry_created=%L
                WHERE usage_kwh=%L AND start_date=%L AND end_date=%L`,
              startDate,
              endDate,
              usage,
              createdDate,
              usage,
              startDate,
              endDate,
            ),
          )
          .catch((err2) => {
            log.error(
              `insertElectricityEntry failed to update value after trying to insert.`,
              `values start_date: ${startDate}, end_date: ${endDate}, usage: ${usage}kWh`,
              `INSERT error message: ${err1}`,
              `UPDATE error message: ${err2}`,
            );
          });
      });
  };

  static selectElectricityEntry = async (startDate: Date, endDate: Date) => {
    return await db
      .query(
        format(
          `SELECT usage_kwh, start_date, end_date 
            FROM electricity_usage 
            WHERE start_date >= %L::date 
            AND end_date <= %L::date 
            ORDER BY start_date ASC`,
          startDate.toISOString(),
          endDate.toISOString(),
        ),
      )
      .then((result) => {
        return result.rows;
      })
      .catch((err) => {
        log.error(`selectElectricityEntry failed with error ${err}`);
        log.trace();
        process.exit(-1);
      });
  };

  static selectGasEntry = async (startDate: Date, endDate: Date) => {
    return await db
      .query(
        format(
          `SELECT usage_kwh, start_date, end_date 
            FROM gas_usage 
            WHERE start_date >= %L::date 
            AND end_date <= %L::date 
            ORDER BY start_date ASC`,
          startDate.toISOString(),
          endDate.toISOString(),
        ),
      )
      .then((result) => {
        return result.rows;
      })
      .catch((err) => {
        log.error(`selectGasEntry failed with error ${err}`);
        log.trace();
        process.exit(-1);
      });
  };

  static insertGasEntry = async (startDate: Date, endDate: Date, usage: number) => {
    const createdDate = new Date();

    return await db
      .query(
        format(
          `INSERT INTO gas_usage
              (start_date, end_date, usage_kwh, entry_created)
              VALUES
              (%L, %L, %L, %L)`,
          startDate,
          endDate,
          usage,
          createdDate,
        ),
      )
      .catch(async (err1) => {
        log.warn(
          `insertGasEntry failed to insert with values start_date: ${startDate}, end_date: ${endDate}, usage: ${usage}kWh. Will try once more`,
        );
        return await db
          .query(
            format(
              `UPDATE gas_usage 
                  SET start_date=%L, end_date=%L, usage_kwh=%L, entry_created=%L
                  WHERE usage_kwh=%L AND start_date=%L AND end_date=%L`,
              startDate,
              endDate,
              usage,
              createdDate,
              usage,
              startDate,
              endDate,
            ),
          )
          .catch((err2) => {
            log.error(
              `insertGasEntry failed to update value after trying to insert.`,
              `values start_date: ${startDate}, end_date: ${endDate}, usage: ${usage}kWh`,
              `INSERT error message: ${err1}`,
              `UPDATE error message: ${err2}`,
            );
          });
      });
  };

  static selectLatestElectricityEntryInsert = async () => {
    return await db
      .query(format(`SELECT MAX(end_date) FROM electricity_usage`))
      .then((result) => {
        if (result.rows[0].max == null) {
          return new Date(process.env.MOVE_IN_DATE);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestElectricityEntryInsert failed with error ${err}`);
        log.trace();
        process.exit(-1);
      });
  };

  static selectLatestGasEntryInsert = async (): Promise<Date> => {
    return await db
      .query(format(`SELECT MAX(end_date) FROM gas_usage`))
      .then((result) => {
        if (result.rows[0].max == null) {
          return new Date(process.env.MOVE_IN_DATE);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestGasEntryInsert failed with error ${err}`);
        log.trace();
        process.exit(-1);
      });
  };

  static selectLatestGasEntry = async () => {
    return await db
      .query(format(`SELECT MAX(start_date) FROM gas_usage`))
      .then((result) => {
        if (result.rows[0].max == null) {
          return new Date(process.env.MOVE_IN_DATE);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestGasEntry failed with error ${err}`);
        log.trace();
      });
  };

  static selectLatestElectricityEntry = async () => {
    return await db
      .query(format(`SELECT MAX(start_date) FROM electricity_usage`))
      .then((result) => {
        if (result.rows[0].max == null) {
          return new Date(process.env.MOVE_IN_DATE);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestElectricityEntry failed with error ${err}`);
        log.trace();
      });
  };

  static selectLatestElectricityRateAndCharge = async () => {
    return await db
      .query(
        format(`SELECT standing_order_rate, rate_kwh
        FROM electricity_bill
        ORDER BY billing_end DESC
        LIMIT 1
        `),
      )
      .then((result) => {
        if (result.rows.length === 0) {
          return {
            standing_order_rate: 45.96,
            rate_kwh: 26.05,
          };
        }
        return result.rows[0];
      })
      .catch((err) => {
        log.error(`selectLatestElectricityRateAndCharge failed with error ${err}`);
        log.trace();
      });
  };

  static selectLatestGasRateAndCharge = async () => {
    return await db
      .query(
        format(`SELECT standing_order_rate, rate_kwh
        FROM gas_bill
        ORDER BY billing_end DESC
        LIMIT 1
        `),
      )
      .then((result) => {
        if (result.rows.length === 0) {
          return {
            standing_order_rate: 45.96,
            rate_kwh: 26.05,
          };
        }
        return result.rows[0];
      })
      .catch((err) => {
        log.error(`selectLatestGasRateAndCharge failed with error ${err}`);
        log.trace();
      });
  };

  static selectStartEndBillDatesFromDate = async (providedDate) => {
    return await db
      .query(
        format(
          `SELECT billing_start, billing_end 
          FROM electricity_bill
          WHERE billing_start <= %L::date
          AND billing_end >= %L::date
          ORDER BY billing_start
          `,
          providedDate.toISOString(),
          providedDate.toISOString(),
        ),
      )
      .then((result) => {
        const start =
          result.rows[0] != undefined ? result.rows[0].billing_start : new Date();
        const end = result.rows[0] != undefined ? result.rows[0].billing_end : new Date();
        return {
          billing_start: start,
          billing_end: end,
        };
      })
      .catch((err) => {
        log.error(`selectStartEndBillDatesFromDate failed with error ${err}`);
        log.trace();
      });
  };

  static selectLatestElectricityBillDate = async () => {
    return await db
      .query(format(`SELECT MAX(billing_end) FROM electricity_bill`))
      .then((result) => {
        if (result.rows[0].max == null) {
          return new Date(process.env.MOVE_IN_DATE);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestElectricityBillDate failed with error ${err}`);
        log.trace();
      });
  };
}

export default EnergyModel;
