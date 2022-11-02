import { getLogger } from "loglevel";
import "../utils/log.utils";
import db from "../db";
import format from "pg-format";
import DateUtils from "../utils/date.utils";
import { EnergyUsage } from "../types/energy.types";
import { TableNames } from "../types/common.types";
const log = getLogger("energy.usage.model");

class EnergyUsageModel {
  static acceptableTables = [TableNames.electricity_usage, TableNames.gas_usage];

  static insertEntry = async (
    table: TableNames,
    startDate: Date,
    endDate: Date,
    usage: number,
  ): Promise<boolean> => {
    if (table !== TableNames.gas_usage && table !== TableNames.electricity_usage) {
      log.error(`insertEntry has been called with an invalid table name`);
      return false;
    }

    const createdDate = new Date();
    return await db
      .query(
        format(
          `
          INSERT INTO ${table}
          (start_date, end_date, usage_kwh, entry_created)
          VALUES
          (%L, %L, %L, %L)
          `,
          startDate,
          endDate,
          usage,
          createdDate,
        ),
      )
      .then(() => true)
      .catch(async (err1) => {
        log.warn(
          `insertElectricityEntry failed to insert with values start_date: ${startDate}, end_date: ${endDate}, usage: ${usage}kWh. Will try once more`,
        );

        return await db
          .query(
            format(
              `
                UPDATE %L 
                SET start_date=%L, end_date=%L, usage_kwh=%L, entry_created=%L
                WHERE usage_kwh=%L AND start_date=%L AND end_date=%L`,
              table,
              startDate,
              endDate,
              usage,
              createdDate,
              usage,
              startDate,
              endDate,
            ),
          )
          .then(() => true)
          .catch((err2) => {
            log.error(
              `insertElectricityEntry failed to update value after trying to insert.`,
              `values start_date: ${startDate}, end_date: ${endDate}, usage: ${usage}kWh`,
              `INSERT error message: ${err1}`,
              `UPDATE error message: ${err2}`,
            );
            return false;
          });
      });
  };

  static selectEntries = async (
    table: TableNames,
    startDate: Date,
    endDate: Date,
  ): Promise<Array<EnergyUsage>> => {
    if (!this.acceptableTables.includes(table)) {
      log.error(`selectEntries has been called with an invalid table name ${table}`);
      return [];
    }
    return await db
      .query(
        format(
          `
            SELECT 
              usage_kwh AS consumption, 
              start_date AS interval_start, 
              end_date AS interval_end
            FROM ${table}
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
        log.error(`selectEntries failed with error ${err}`);
        log.trace();
        return [];
      });
  };

  /**
   * This method is intended to find out what the latest entry present in the databse is,
   * with the intention of identifying from which point data has to be fetched from
   * @param table
   * @returns The end_date of the latest entry that has been inserted into the database
   */
  static selectLatestDate = async (table: TableNames): Promise<Date> => {
    if (!this.acceptableTables.includes(table)) {
      log.error(`selectLatestDate has been called with an invalid table name ${table}`);
      return new Date(0);
    }

    return await db
      .query(`SELECT MAX(end_date) FROM ${table}`)
      .then((result) => {
        if (result.rows[0].max == null) {
          return new Date(process.env.MOVE_IN_DATE);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestDate failed with error ${err}`);
        log.trace();
        return new Date(0);
      });
  };

  /**
   * This method is intended to find out the latest date for which all data about a given
   * table is present, with the intention of providing reporting information about that day.
   * @param table TableNames.gas_usage or TableNames.electricity_usage
   * @returns The latest date for which the daily entry is complete
   */
  static selectLatestCompletedDate = async (table: TableNames): Promise<Date> => {
    if (!this.acceptableTables.includes(table)) {
      log.error(
        `selectLatestCompletedDate has been called with an invalid table name ${table}`,
      );
      return new Date(0);
    }

    return await db
      .query(
        `
        SELECT 
            MAX(end_date)
        FROM ${table}
        WHERE
            date_part('hour', end_date AT TIME ZONE 'UTC') = 0
            AND
            date_part('minute', end_date AT TIME ZONE 'UTC') = 0
        `,
      )
      .then((result) => {
        if (result.rows.length === 0) {
          log.error(`selectLatestCompletedDate failed - Database was empty!`);
          return new Date(0);
        }
        return new Date(result.rows[0].max);
      })
      .catch((err) => {
        log.error(`selectLatestCompletedDate failed with error ${err}`);
        log.trace();
        return new Date(0);
      });
  };
}

export default EnergyUsageModel;
