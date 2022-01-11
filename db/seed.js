const db = require("./index");
const utils = require("../utils");
const format = require("pg-format");

exports.seed = async () => {
  const createUsertable = `CREATE TABLE "usertable" (
        "ip" varchar(255) NOT NULL PRIMARY KEY,
        "username" varchar(255) NOT NULL
        );`;

  const createTimesheet = `CREATE TABLE "timesheet" (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    day_date DATE NOT NULL,
    clock_in TIME NOT NULL,
    break_in TIME,
    break_out TIME,
    clock_out TIME
    );`;

  const insertUsertable = [
    `INSERT INTO usertable (ip, username) VALUES ('::ffff:127.0.0.1', 'joel');`,
  ];

  const insertTimsheet = [
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-01', '09:00:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-02', '09:00:00', '13:15:00', '14:15:00', '18:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-03', '08:30:00', '13:00:00', '14:00:00', '17:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-04', '09:15:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-04', '09:45:00', '13:00:00', '14:00:00', '18:15:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-01', '09:00:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-02', '09:00:00', NULL, NULL, '18:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-03', '08:30:00', NULL, NULL, '17:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-04', '09:15:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-04', '09:45:00', '13:00:00', '14:00:00', '18:15:00');`,
    // format(
    //   `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', %L, '09:00', '13:00', '14:00', '18:00');`, utils.todayIso()
    // ),
    // format(
    //   `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', %L, '09:45', null, null, null);`,
    //   utils.todayIso()
    // ),
  ];

  await db.query("DROP TABLE IF EXISTS timesheet");
  await db.query("DROP TABLE IF EXISTS usertable");
  await db.query(createUsertable);
  await db.query(createTimesheet);
  for (query of insertUsertable) {
    await db.query(query);
  }
  for (query of insertTimsheet) {
    await db.query(query);
  }
  console.log("Seeded Database");
};
