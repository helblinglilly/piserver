import log from "loglevel";
import db from "../db";
import format from "pg-format";
import DateUtils from "../utils/date.utils";
import { QueryResult } from "pg";

const logger = log.getLogger("timesheet-model");

class TimesheetModel {
  static selectDay = async (day: Date, username: string) => {
    let result: QueryResult<any>;
    try {
      result = await db.query(
        format(
          `SELECT username, day_date, clock_in, break_in, break_out, clock_out
          FROM timesheet
          WHERE day_date=%L AND username=%L`,
          day.toISOString().split("T")[0],
          username,
        ),
      );
    } catch (err) {
      logger.error("selectDay failed with error:", err);
    }

    if (result.rows.length === 0) return null;

    result.rows[0].clock_in = DateUtils.constructUTCDateFromLocal(
      result.rows[0].day_date,
      result.rows[0].clock_in,
    );

    result.rows[0].break_in = DateUtils.constructUTCDateFromLocal(
      result.rows[0].day_date,
      result.rows[0].break_in,
    );

    result.rows[0].break_out = DateUtils.constructUTCDateFromLocal(
      result.rows[0].day_date,
      result.rows[0].break_out,
    );

    result.rows[0].clock_out = DateUtils.constructUTCDateFromLocal(
      result.rows[0].day_date,
      result.rows[0].clock_out,
    );

    return result.rows[0];
  };

  static insertClockIn = async (day: Date, username: string) => {
    day.setSeconds(0);
    day.setMilliseconds(0);

    try {
      await db.query(
        format(
          `INSERT INTO timesheet (day_date, username, clock_in) VALUES (%L, %L, %L)`,
          day.toISOString().split("T")[0],
          username,
          day.toISOString().split("T")[1],
        ),
      );
    } catch (err) {
      logger.error("insertClockIn failed with error: ", err);
    }
  };

  static updateClockIn = async (day: Date, username: string) => {
    day.setSeconds(0);
    day.setMilliseconds(0);

    try {
      await db.query(
        format(
          `UPDATE timesheet SET clock_in=%L WHERE day_date=%L AND username=%L`,
          day.toISOString().split("T")[1],
          day.toISOString().split("T")[0],
          username,
        ),
      );
    } catch (err) {
      logger.error("updateClockIn failed with error:", err);
    }
  };

  static updateBreakStart = async (day: Date, username: string) => {
    day.setSeconds(0);
    day.setMilliseconds(0);

    try {
      await db.query(
        format(
          `UPDATE timesheet SET break_in=%L WHERE day_date=%L AND username=%L`,
          day.toISOString().split("T")[1],
          day.toISOString().split("T")[0],
          username,
        ),
      );
    } catch (err) {
      logger.error("updateBreakStart failed with error:", err);
    }
  };

  static updateBreakEnd = async (day: Date, username: string) => {
    day.setSeconds(0);
    day.setMilliseconds(0);

    try {
      await db.query(
        format(
          `UPDATE timesheet SET break_out=%L WHERE day_date=%L AND username=%L`,
          day.toISOString().split("T")[1],
          day.toISOString().split("T")[0],
          username,
        ),
      );
    } catch (err) {
      logger.error("updateBreakEnd failed with error:", err);
    }
  };

  static updateClockOut = async (day: Date, username: string) => {
    day.setSeconds(0);
    day.setMilliseconds(0);

    try {
      await db.query(
        format(
          `UPDATE timesheet SET clock_out=%L WHERE day_date=%L AND username=%L`,
          day.toISOString().split("T")[1],
          day.toISOString().split("T")[0],
          username,
        ),
      );
    } catch (err) {
      logger.error("updateClockOut failed with error:", err);
    }
  };
}

export default TimesheetModel;
