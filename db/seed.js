const db = require("./index");

exports.seed = async () => {
  const createUsertable = `CREATE TABLE "usertable" (
        "ip" varchar(255) NOT NULL PRIMARY KEY,
        "username" varchar(255) NOT NULL
        );`;

  const createTimesheet = `CREATE TABLE "timesheet" (
    "username" VARCHAR NOT NULL,
    "day_date" DATE NOT NULL,
    "clock_in" TIME NOT NULL,
    "break_in" TIME,
    "break_out" TIME,
    "clock_out" TIME,
    PRIMARY KEY(username, day_date)
    );`;

  const insertUsertable = [
    `INSERT INTO usertable (ip, username) VALUES ('::ffff:127.0.0.1', 'joel');`,
  ];

  const insertTimsheet = [
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-01', '09:00', '13:00', '14:00', '17:30');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-02', '09:00', '13:15', '14:15', '17:45');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-03', '08:30', '13:00', '14:00', '17:00');`,
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
  console.log("here");
  console.log("Seeded");
};
