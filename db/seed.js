const db = require("./index");

exports.seed = async () => {
  const dropTimesheet = `DROP TABLE timesheet;`;
  const createTimesheets = `CREATE TABLE "timesheet" (
    "username" varchar(15) NOT NULL,
    "day_date" DATE NOT NULL,
    "clock_in" TIME NOT NULL,
    "break_in" TIME,
    "break_out" TIME,
    "clock_out" TIME,
    PRIMARY KEY(username, day_date)
  );`;
  const insertData = [
    `INSERT INTO timesheet(username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-08', '09:00', '13:00', '14:00', '17:30') RETURNING *;`,
    `INSERT INTO timesheet(username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-09', '09:00', '13:00', '14:00', '17:30') RETURNING *;`,
    `INSERT INTO timesheet(username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-10', '09:00', '13:00', '14:00', '17:30') RETURNING *;`,
    `INSERT INTO timesheet(username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-11', '09:00', '13:00', '14:00', '17:30') RETURNING *;`,
    `INSERT INTO timesheet(username, day_date, clock_in, clock_out) VALUES ('harry', '2022-01-09', '11:00', '19:00') RETURNING *;`,
    `INSERT INTO timesheet(username, day_date, clock_in, clock_out) VALUES ('harry', '2022-01-10', '11:00', '19:00') RETURNING *;`,
    `INSERT INTO timesheet(username, day_date, clock_in, clock_out) VALUES ('harry', '2022-01-11', '11:00', '19:00') RETURNING *;`,
  ];

  try {
    await db.query(dropTimesheet);
  } catch (err) {
    console.log(err);
  }
  await db.query(createTimesheets);
  for (query of insertData) {
    try {
      await db.query(query);
    } catch (err) {
      console.log(err);
    }
    console.log(`Completed: ${query}`);
  }
};
/*
INSERT INTO timesheet(username, day_date, clock_in) VALUES ('joel', '2022-01-08', '11:45') RETURNING *;
UPDATE timesheet SET break_in = '14:00' WHERE username='joel' AND day_date = '2022-01-08' RETURNING *;
*/
