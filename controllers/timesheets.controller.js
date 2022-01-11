const timesheetsModel = require("../models/timsheets.model");
const utils = require("../utils");

exports.getTimesheets = async (req, res, next) => {
  const options = {};
  options.day = utils.today();

  const ip = req.socket.remoteAddress;
  const username = await timesheetsModel.selectUsername(ip);

  const rows = await timesheetsModel.selectDay(utils.todayIso(), username);

  // Clock in
  if (!rows) {
    options.nextAction = "Clock In";
    let endTime = utils.addTime(new Date(), {
      hours: 8,
      minutes: 30,
    });
    options.endTime = `${utils.DateTimeToTime(endTime)}`;
  } else {
    if (!rows.break_in && !rows.clock_out) {
      options.nextAction = "Break In";

      const clockIn = new Date();
      clockIn.setHours(rows.clock_in.substr(0, 2));
      clockIn.setMinutes(rows.clock_in.substr(3, 2));

      let endTime = utils.addTime(clockIn, { hours: 8, minutes: 30 });
      options.endTime = `${utils.DateTimeToTime(endTime)}`;
    } else if (rows.break_in && !rows.break_out && !rows.clock_out) {
      options.nextAction = "Break Out";

      const clock_in = new Date(rows.day_date);
      clock_in.setHours(rows.clock_in.substr(0, 2));
      clock_in.setMinutes(rows.clock_in.substr(3, 2));

      const break_in = new Date(rows.day_date);
      break_in.setHours(rows.break_in.substr(0, 2));
      break_in.setMinutes(rows.break_in.substr(3, 2));

      const backFromBreak = utils.addTime(break_in, { hours: 1, minutes: 0 });
      const backFromBreakTime = utils.DateTimeToTime(backFromBreak);

      const millisecondsLeft = 7.5 * 60 * 60 * 1000 - (break_in - clock_in); // 7.5hours/day work contract
      const timeLeftAtWork = {
        hours: Math.round(millisecondsLeft / 60 / 60 / 1000),
        minutes: ((millisecondsLeft / 60 / 60 / 1000) % 1) * 60,
      };
      const doneWithWork = utils.DateTimeToTime(
        utils.addTime(backFromBreak, timeLeftAtWork)
      );

      options.endTime = `Back: ${backFromBreakTime}\nDone by: ${doneWithWork}`;
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

exports.selectGet = (_, res, next) => {
  res.render("timesheets/select");
};

exports.selectPost = (req, res, next) => {
  const ip = req.socket.remoteAddress;
  const username = req.body.username;
  timesheetsModel.insertUsertable(ip, username);
  console.log("done");
  res.send(`Hello ${req.body.username}`);
};

exports.view = (req, res, next) => {
  // res.render("timesheets/view", { ...options });
  res.render("timesheets/view");
};

exports.edit = (req, res, next) => {
  // res.render("timesheets/view", { ...options });
  res.render("timesheets/edit");
};
