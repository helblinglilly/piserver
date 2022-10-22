import db from "../db";
import format from "pg-format";

exports.readByDate = async (username: string, date: Date) => {
  return db
    .query(
      format(
        `SELECT timestamp, action FROM stopwatch WHERE day_date=%L AND username=%L ORDER BY timestamp DESC`,
        date.toISOString().split("T")[0],
        username,
      ),
    )
    .then((result: { rows: any[] }) => {
      result.rows.forEach((entry) => {
        return (entry.timestamp = new Date(
          Date.parse(date.toISOString().split("T")[0] + "T" + entry.timestamp + "Z"),
        ));
      });
      return result.rows;
    });
};

exports.insert = async (
  username: string,
  date: Date,
  action: "START" | "CONT" | "STOP" | "END",
) => {
  const possibleActions = ["START", "CONT", "STOP", "END"];
  if (!possibleActions.includes(action)) {
    return;
  }

  db.query(
    format(
      `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES (%L, %L, %L, %L)`,
      username,
      date.toISOString().split("T")[0],
      date.toISOString().split("T")[1],
      action,
    ),
  );
};
