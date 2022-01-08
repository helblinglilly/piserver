const timesheetsModel = require("../models/timsheets.model");
const utils = require("../utils");

exports.getTimesheets = (_, res, next) => {
  const options = {};
  options.day = utils.today();
  options.nextAction = timesheetsModel.selectNextAction();
  options.endTime = timesheetsModel.selectEndTime();

  res.render("timesheets/index", { ...options });
};

exports.enter = (req, res, next) => {
  if (req.body.action) {
    switch (req.body.action) {
      case "Clock In":
        timesheetsModel.insertClockIn();
        break;
      case "Start Break":
        timesheetsModel.insertBreakStart();
        break;
      case "End Break":
        timesheetsModel.insertBreakEnd();
        break;
      case "Clock Out":
        timesheetsModel.insertClockOut();
        break;
    }
    res.redirect("/timesheet");
  } else {
    next({ statusCode: 400, msg: "Page not found" });
  }
};

exports.view = (req, res, next) => {
  // res.render("timesheets/view", { ...options });
  res.render("timesheets/view");
};

exports.edit = (req, res, next) => {
  // res.render("timesheets/view", { ...options });
  res.render("timesheets/edit");
};
