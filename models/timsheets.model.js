const db = require("../db");
const format = require("pg-format");

const env = process.env.NODE_ENV || "dev";

exports.selectDay = async (day, username) => {
  return db
    .query(
      format(
        `SELECT * FROM timesheet_${env} WHERE day_date=%L AND username=%L`,
        day,
        username,
      ),
    )
    .then(({ rows }) => rows[0]);
};

exports.selectUsername = async (ip) => {
  return db
    .query(format(`SELECT username FROM usertable_${env} WHERE ip LIKE %L`, ip))
    .then((result) => {
      if (result.rows.length === 0) return null;
      else return result.rows[0].username;
    });
};

exports.insertUsertable = async (ip, username) => {
  try {
    return db.query(
      format(`INSERT INTO usertable_${env} (ip, username) VALUES (%L, %L)`, ip, username),
    );
  } catch (err) {
    console.log(err);
  }
};

exports.insertClockIn = async (day, username, time) => {
  db.query(
    format(
      `INSERT INTO timesheet_${env} (day_date, username, clock_in) VALUES (%L, %L, %L)`,
      day,
      username,
      time,
    ),
  )
    .then(() => console.log(`Inserted clock in: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};

exports.updateClockIn = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet_${env} SET clock_in=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  )
    .then(() => console.log(`Updated clock in: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};

exports.updateBreakStart = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet_${env} SET break_in=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  )
    .then(() => console.log(`Inserted break in: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};

exports.updateBreakEnd = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet_${env} SET break_out=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  )
    .then(() => console.log(`Inserted break end: ${username} ${day} ${time}`))
    .catch((err) => console.log(err));
};

exports.updateClockOut = async (day, username, time) => {
  db.query(
    format(
      `UPDATE timesheet_${env} SET clock_out=%L WHERE day_date=%L AND username=%L`,
      time,
      day,
      username,
    ),
  ).catch((err) => console.log(err));
};
