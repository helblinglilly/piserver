const db = require("../db");
const format = require("pg-format");

exports.readByDate = async (username, date) => {
  return db
    .query(
      format(
        `SELECT timestamp, action FROM stopwatch WHERE day_date=%L AND username=%L ORDER BY timestamp DESC`,
        date.toISOString().split("T")[0],
        username,
      ),
    )
    .then((result) => {
      result.rows.forEach(
        (entry) =>
          (entry.timestamp = new Date(
            Date.parse(
              date.toISOString().split("T")[0] + "T" + entry.timestamp + ".000Z",
            ),
          )),
      );
      return result.rows;
    });
};

exports.insert = async (username, date, action) => {
  const possibleActions = ["START", "CONT", "STOP", "END"];
  if (!possibleActions.includes(action)) {
    return;
  }

  db.query(
    format(
      `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES (%L, %L, %L, %L)`,
      username,
      date.toISOString().split("T")[0],
      date.toISOString().split("T")[1].split(".")[0],
      action,
    ),
  );
};
