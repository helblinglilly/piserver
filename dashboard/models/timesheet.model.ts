import log from "loglevel";
import db from "../db";
import format from "pg-format";

const logger = log.getLogger("timesheet-model");

class TimesheetModel {
  static selectDay = async (day: Date, username: string) => {
    const result = await db.query(
      format(
        `SELECT username, day_date, clock_in, break_in, break_out, clock_out
        FROM timesheet
        WHERE day_date=%L AND username=%L`,
        day.toISOString().split("T")[0],
        username,
      ),
    );
  };
}

export default TimesheetModel;
