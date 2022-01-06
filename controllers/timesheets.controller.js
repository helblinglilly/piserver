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
    switch (req.query.action) {
      case "Clock In":
        console.log("Action to Clock In");
        break;
      case "Start Break":
        console.log("Action to Start Break");
        break;
      case "End Break":
        console.log("Action to End Break");
        break;
      case "Clock Out":
        console.log("Action to Clock Out");
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
