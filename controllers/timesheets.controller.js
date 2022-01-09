const timesheetsModel = require("../models/timsheets.model");
const utils = require("../utils");

exports.getTimesheets = async (req, res, next) => {
  const options = {};
  options.day = utils.today();

  const ip = req.socket.remoteAddress;
  const username = await timesheetsModel.getUsername(ip);

  const rows = await timesheetsModel.selectDay(utils.todayIso(), username);

  // Clock in
  if (!rows) {
    options.nextAction = "Clock In";
    let endTime = utils.addTime(new Date(), {
      hours: 8,
      minutes: 30,
    });
    options.endTime = `${endTime.getHours()}:${endTime.getMinutes()}`;
  } else {
    if (!rows.break_in && !rows.clock_out) {
      options.nextAction = "Break In";

      const clockIn = new Date();
      clockIn.setHours(rows.clock_in.substr(0, 2));
      clockIn.setMinutes(rows.clock_in.substr(3, 2));

      let endTime = utils.addTime(clockIn, { hours: 8, minutes: 30 });
      options.endTime = `${endTime.getHours()}:${endTime.getMinutes()}`;
    } else if (rows.break_in && !rows.break_out && !rows.clock_out) {
      options.nextAction = "Break Out";

      const clockIn = new Date();
      clockIn.setHours(rows.clock_in.substr(0, 2));
      clockIn.setMinutes(rows.clock_in.substr(3, 2));

      let endTime = utils.addTime(clockIn, { hours: 8, minutes: 30 });
      options.endTime = `${endTime.getHours()}:${endTime.getMinutes()}`;
    }
  }

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
