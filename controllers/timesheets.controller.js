const timesheetsModel = require("../models/timsheets.model");
const utils = require("../utils");

exports.getTimesheets = async (req, res, next) => {
  const options = {};
  options.day = utils.today();

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const username = await timesheetsModel.selectUsername(ip);
  if (!username) {
    res.redirect("/timesheet/select");
  }

  const rows = await timesheetsModel.selectDay(utils.todayIso(), username);
  const now = new Date();

  if (!rows) {
    options.nextAction = "Clock In";
    let endTime = utils.addTime(now, {
      hours: 8,
      minutes: 30,
    });
    options.endTime = `${utils.dateTimeToTime(endTime)}`;
  } else {
    if (rows.clock_in && !rows.break_in && !rows.break_out && !rows.clock_out) {
      options.nextAction = "Break In";
      const clockIn = utils.constructDateTime(now, rows.clock_in);

      const endTime = utils.addTime(clockIn, { hours: 8, minutes: 30 });
      if (endTime < now) {
        const overtimeWorked = {
          hours: Math.trunc((now - endTime) / 60 / 60 / 1000),
          minutes: Math.trunc((((now - endTime) / 60 / 60 / 1000) % 1) * 60),
        };
        options.endTime = `Overtime: ${overtimeWorked.hours}h ${overtimeWorked.minutes}min`;
      } else options.endTime = `${utils.dateTimeToTime(endTime)}`;
    } else if (rows.clock_in && rows.break_in && !rows.break_out && !rows.clock_out) {
      options.nextAction = "Break End";
      const clock_in = utils.constructDateTime(rows.day_date, rows.clock_in);
      const break_in = utils.constructDateTime(rows.day_date, rows.break_in);

      const plusOneHour = utils.addTime(break_in, {
        hours: 1,
        minutes: 0,
      });
      const difference = now > plusOneHour ? now : plusOneHour;
      const backFromBreakTime = utils.dateTimeToTime(difference);

      const millisecondsLeft = 7.5 * 60 * 60 * 1000 - (break_in - clock_in);
      const timeLeftAtWork = {
        hours: Math.round(millisecondsLeft / 60 / 60 / 1000),
        minutes: ((millisecondsLeft / 60 / 60 / 1000) % 1) * 60,
      };

      const doneWithWork = utils.dateTimeToTime(
        utils.addTime(difference, timeLeftAtWork),
      );
      options.endTime = `Back: ${backFromBreakTime}\nDone by: ${doneWithWork}`;
    } else if (rows.clock_in && rows.break_in && rows.break_out && !rows.clock_out) {
      options.nextAction = "Clock Out";
      let displayText = "";
      const clock_in = utils.constructDateTime(rows.day_date, rows.clock_in);
      const break_in = utils.constructDateTime(rows.day_date, rows.break_in);
      const break_out = utils.constructDateTime(rows.day_date, rows.break_out);

      // 7.5hours/day work contract
      const timeWorked = now - break_out + (break_in - clock_in);
      const millisecondsLeft = 7.5 * 60 * 60 * 1000 - timeWorked;

      if (millisecondsLeft > 0) {
        const timeLeftAtWork = {
          hours: Math.trunc(millisecondsLeft / 60000 / 60),
          minutes: (millisecondsLeft / 60000) % 60,
        };

        displayText = utils.dateTimeToTime(utils.addTime(now, timeLeftAtWork));
      } else {
        displayText = overtime(
          rows.clock_in,
          rows.break_in,
          rows.break_out,
          utils.dateTimeToTime(new Date()),
        );
      }

      options.endTime = `${displayText}`;
    } else if (rows.clock_in && rows.break_in && rows.break_out && rows.clock_out) {
      options.nextAction = "Done for the day :)";
      let displayText = "";

      displayText = overtime(
        rows.clock_in,
        rows.break_in,
        rows.break_out,
        rows.clock_out,
      );

      options.endTime = `${displayText}`;
    }
  }
  res.render("timesheets/index", { ...options });
};

exports.enter = async (req, res, next) => {
  if (req.body.action) {
    const now = new Date();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const username = await timesheetsModel.selectUsername(ip);
    switch (req.body.action) {
      case "Clock In":
        timesheetsModel.insertClockIn(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Break In":
        timesheetsModel.insertBreakStart(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Break End":
        timesheetsModel.insertBreakEnd(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Clock Out":
        timesheetsModel.insertClockOut(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Done for the day :)":
        res.redirect("https://youtu.be/kxSOhBdwmc4?t=1");
        break;
      default:
        next({ statusCode: 500, msg: "Invalid action" });
        break;
    }
  } else {
    next({ statusCode: 400, msg: "Page not found" });
  }
};

exports.selectGet = (_, res, next) => {
  res.render("timesheets/select");
};

exports.selectPost = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const username = req.body.username;
  timesheetsModel.insertUsertable(ip, username);
  res.redirect(302, "/timesheet");
};

exports.view = async (req, res, next) => {
  const options = {};
  options.date = req.query.date ? req.query.date : utils.todayIso();

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const username = await timesheetsModel.selectUsername(ip);
  const entry = await timesheetsModel.selectDay(options.date, username);

  if (entry) {
    options.clock_in = entry.clock_in.substr(0, 5);
    options.break_in = entry.break_in ? entry.break_in.substr(0, 5) : null;
    options.break_out = entry.break_out ? entry.break_out.substr(0, 5) : null;
    options.clock_out = entry.clock_out ? entry.clock_out.substr(0, 5) : null;

    options.difference = overtime(
      entry.clock_in,
      entry.break_in,
      entry.break_out,
      entry.clock_out,
    );

    if (!options.clock_out) options.alert = "Day not completed yet";
  }

  res.render("timesheets/view", { ...options });
};

exports.edit = async (req, res, next) => {
  const options = {};
  options.date = req.query.date ? req.query.date : utils.todayIso();

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const username = await timesheetsModel.selectUsername(ip);
  const entry = await timesheetsModel.selectDay(options.date, username);

  if (entry) {
    options.clock_in = entry.clock_in.substr(0, 5);
    options.break_in = entry.break_in ? entry.break_in.substr(0, 5) : null;
    options.break_out = entry.break_out ? entry.break_out.substr(0, 5) : null;
    options.clock_out = entry.clock_out ? entry.clock_out.substr(0, 5) : null;

    options.difference = overtime(
      entry.clock_in,
      entry.break_in,
      entry.break_out,
      entry.clock_out,
    );

    if (!options.clock_out) options.alert = "Day not completed yet";
  }

  res.render("timesheets/view", { ...options });
  res.render("timesheets/edit");
};

overtime = (clock_in, break_in, break_out, clock_out) => {
  if (!clock_in || !clock_out) return;

  clock_in = utils.constructDateTime(new Date(), clock_in);
  clock_out = utils.constructDateTime(new Date(), clock_out);

  let timeWorked = 0;
  if (!break_in && !break_out) {
    timeWorked = clock_out - clock_in;
  } else {
    break_in = utils.constructDateTime(new Date(), break_in);
    break_out = utils.constructDateTime(new Date(), break_out);
    timeWorked = clock_out - break_out + (break_in - clock_in);
  }

  let millisecondDifference = 7.5 * 60 * 60 * 1000 - timeWorked;
  const plusMinus = millisecondDifference < 0 ? "+" : "-";
  millisecondDifference = Math.abs(millisecondDifference);

  const difference = {
    hours: Math.trunc(millisecondDifference / 60000 / 60),
    minutes: (millisecondDifference / 60000) % 60,
  };
  return difference.hours >= 1
    ? `${plusMinus}${difference.hours}h${difference.minutes}min`
    : `${plusMinus}${difference.minutes}min`;
};
