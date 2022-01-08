const db = require("../db");
const seeding = require("../db/seed");

exports.selectTimesheets = () => {};

exports.selectNextAction = async () => {
  db.connect();
  seeding.seed();

  const output = await db.query(`SELECT * FROM timesheet`);
  console.log(output);

  return "Clock In";
};

exports.selectEndTime = () => {
  return "17:15";
};

exports.insertClockIn = () => {
  console.log("Action to Clock In");
};

exports.insertBreakStart = () => {
  console.log("Action to Break Start");
};

exports.insertBreakEnd = () => {
  console.log("Action to Break End");
};

exports.insertClockOut = () => {
  console.log("Action to Clock Out");
};
