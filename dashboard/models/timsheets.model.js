const db = require("../db");
const format = require("pg-format");

const env = process.env.NODE_ENV || "dev";

exports.selectDay = async (day, username) => {
  return db
    .query(
      format(`SELECT * FROM timesheet WHERE day_date=%L AND username=%L`, day, username),
    )
    .then(({ rows }) => rows[0]);
};

exports.insertClockIn = async (day, username, time) => {
  db.query(
    format(
      `INSERT INTO timesheet (day_date, username, clock_in) VALUES (%L, %L, %L)`,
      day,
      username,
      time,
    ),
  ).catch((err) => console.log(err));
};

exports.updateClockIn = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet SET clock_in=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  ).catch((err) => console.log(err));
};

exports.updateBreakStart = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet SET break_in=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  ).catch((err) => console.log(err));
};

exports.updateBreakEnd = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet SET break_out=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  ).catch((err) => console.log(err));
};

exports.updateClockOut = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet SET clock_out=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  ).catch((err) => console.log(err));
};
