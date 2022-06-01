const db = require("../db");
const utils = require("../utils/timesheet.utils");
const format = require("pg-format");

exports.selectDay = async (day, username) => {
  return db
    .query(
      format(
        `SELECT * FROM timesheet WHERE day_date=%L AND username=%L`,
        day.toISOString().split("T")[0],
        username,
      ),
    )
    .then(({ rows }) => {
      if (rows.length === 0) return null;
      rows[0].clock_in = utils.constructUTCDateTime(rows[0].day_date, rows[0].clock_in);
      rows[0].break_in = utils.constructUTCDateTime(rows[0].day_date, rows[0].break_in);
      rows[0].break_out = utils.constructUTCDateTime(rows[0].day_date, rows[0].break_out);
      rows[0].clock_out = utils.constructUTCDateTime(rows[0].day_date, rows[0].clock_out);
      return rows[0];
    });
};

exports.insertClockIn = async (day, username) => {
  db.query(
    format(
      `INSERT INTO timesheet (day_date, username, clock_in) VALUES (%L, %L, %L)`,
      day,
      username,
      day,
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
