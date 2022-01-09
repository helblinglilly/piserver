const db = require("../db");
const format = require("pg-format");

exports.selectDay = async (day, username) => {
  return db
    .query(
      format(
        `SELECT * FROM timesheet WHERE day_date=%L AND username=%L`,
        day,
        username
      )
    )
    .then(({ rows }) => rows[0]);
};

exports.getUsername = async (ip) => {
  return db
    .query(format(`SELECT username FROM usertable WHERE ip LIKE %L`, ip))
    .then(({ rows }) => rows[0].username);
};

/*
exports.insertClockIn = (day, username, time) => {
  db.query(
    format(
      `INSERT INTO timesheet (day_date, username, clock_in) VALUES (%L, %L, %L)`,
      day,
      username,
      time
    )
  )
    .then(() => console.log(`Inserted clock in: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};

exports.insertBreakStart = (day, username, time) => {
  db.query(
    format(
      `INSERT INTO timesheet (day_date, username, break_in) VALUES (%L, %L, %L)`,
      day,
      username,
      time
    )
  )
    .then(() => console.log(`Inserted break in: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};

exports.insertBreakEnd = (day, username, time) => {
  db.query(
    format(
      `INSERT INTO timesheet (day_date, username, break_end) VALUES (%L, %L, %L)`,
      day,
      username,
      time
    )
  )
    .then(() => console.log(`Inserted break end: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};

exports.insertClockOut = (day, username, time) => {
  db.query(
    format(
      `INSERT INTO timesheet (day_date, username, clock_out) VALUES (%L, %L, %L)`,
      day,
      username,
      time
    )
  )
    .then(() => console.log(`Inserted clock out: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};
*/
