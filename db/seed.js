const db = require("./index");
const utils = require("../utils");
const format = require("pg-format");

const env = process.env.NODE_ENV || "dev";
exports.seed = async () => {
  const createUsertable = `CREATE TABLE IF NOT EXISTS usertable_${env} (
        ip varchar(255) NOT NULL PRIMARY KEY,
        username varchar(255) NOT NULL
        );`;

  const createTimesheet = `CREATE TABLE IF NOT EXISTS timesheet_${env} (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    day_date DATE NOT NULL,
    clock_in TIME NOT NULL,
    break_in TIME,
    break_out TIME,
    clock_out TIME
    );`;

  const insertTimsheet = [
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-01', '09:00:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-02', '09:00:00', '13:15:00', '14:15:00', '18:00:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-03', '009:00:00', '13:15:00', '14:15:00', '18:45:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-04', '09:15:00', '13:00:00', '14:00:00', '20:30:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-05', '09:45:00', '13:00:00', '13:45:00', '16:15:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-06', '09:00:00', '13:00:00', '14:00:00', '17:00:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-07', '09:00:00', null, null, '17:00:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-08', '09:00:00', '13:00:00', '14:00:00', null);`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-01', '09:00:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-02', '09:00:00', NULL, NULL, '18:00:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-03', '08:30:00', NULL, NULL, '17:00:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-04', '09:15:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet_${env} (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-04', '09:45:00', '13:00:00', '14:00:00', '18:15:00');`,
    /*
		format(
			`INSERT INTO "timesheet-${env}" (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', %L, '09:00', '13:00', '14:00', null);`,
			utils.todayIso()
		),
		format(
			`INSERT INTO "timesheet-${env}" (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', %L, '09:45', null, null, null);`,
			utils.todayIso()
		),
		*/
  ];

  if (env === "dev" || env === "test") {
    await db.query(`DROP TABLE IF EXISTS timesheet_${env}`);
    await db.query(`DROP TABLE IF EXISTS usertable_${env}`);
  }

  await db.query(createUsertable);
  await db.query(createTimesheet);

  if (env === "dev") {
    for (query of insertTimsheet) {
      await db.query(query);
    }
  }
};
