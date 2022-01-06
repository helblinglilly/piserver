const timesheetsModel = require("../models/timsheets.model");
const utils = require("../utils");

exports.getTimesheets = (_, res, next) => {
  res.render("timesheets/index", { day: utils.today() });
};
