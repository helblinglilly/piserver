const timesheetsModel = require("../models/timsheets.model");

exports.getTimesheets = (_, res, next) => {
  res.render("timesheets/index", { host: "http://127.0.0.1:9090" });
};
