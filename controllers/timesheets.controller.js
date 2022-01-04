const setup = require("../setup");
const timesheetsModel = require("../models/timsheets.model");

exports.getTimesheets = (_, res, next) => {
  res.render("timesheets/index", { host: setup.HOST });
};
