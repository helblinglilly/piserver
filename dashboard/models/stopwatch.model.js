const db = require("../db");
const format = require("pg-format");

const env = process.env.NODE_ENV || "dev";

exports.readByDate = async (username, date) => {
  const result = db.query(
    format(
      `SELECT timestamp, action FROM stopwatch_${env} WHERE day_date=%L AND username=%L ORDER BY timestamp`,
      date.toISOString().split("T")[0],
      username,
    ),
  );
  return (await result).rows;
};

exports.insert = async (username, date, action) => {
  const possibleActions = ["START", "CONT", "STOP", "END"];
  if (!possibleActions.includes(action)) {
    console.log("Massive issue - stopwatch not a valid option");
    return;
  }

  db.query(
    format(
      `INSERT INTO stopwatch_${env} (username, day_date, timestamp, action) VALUES (%L, %L, %L, %L)`,
      username,
      date.toISOString().split("T")[0],
      date.toISOString().split("T")[1].split(".")[0],
      action,
    ),
  );
};
