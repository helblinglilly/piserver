const timesheetsModel = require("../models/timsheets.model");
const utils = require("../utils");

const calculateTime = (rows) => {
  const now = new Date();
  // Init as clock in
  const result = {};
  result.day = new Date();
  result.nextAction = "Clock In";
  result.proposedEndTime = utils.addTime(now, {
    hours: 8,
    minutes: 30,
  });
  result.overtimeStatus = false;

  if (!rows) return result;
  // Break In
  if (rows.clock_in && !rows.break_in && !rows.break_out && !rows.clock_out) {
    result.nextAction = "Break In";
    const clockIn = utils.constructDateTime(now, rows.clock_in);
    const endTime = utils.addTime(clockIn, { hours: 8, minutes: 30 });
    if (endTime < new Date()) {
      const overtimeWorked = {
        hours: Math.trunc((now - endTime) / 60 / 60 / 1000),
        minutes: Math.trunc((((now - endTime) / 60 / 60 / 1000) % 1) * 60),
      };
      result.overtimeStatus = true;
      result.overtimeWorked = {
        hours: overtimeWorked.hours,
        minutes: overtimeWorked.minutes,
      };
    } else {
      result.proposedEndTime = endTime;
    }
  }
  // Break End
  if (rows.clock_in && rows.break_in && !rows.break_out && !rows.clock_out) {
    result.nextAction = "Break End";
    const clock_in = utils.constructDateTime(rows.day_date, rows.clock_in);
    const break_in = utils.constructDateTime(rows.day_date, rows.break_in);

    const plusOneHour = utils.addTime(break_in, {
      hours: 1,
      minutes: 0,
    });
    const difference = now > plusOneHour ? now : plusOneHour;

    const millisecondsLeft = 7.5 * 60 * 60 * 1000 - (break_in - clock_in);
    const timeLeftAtWork = {
      hours: Math.round(millisecondsLeft / 60 / 60 / 1000),
      minutes: ((millisecondsLeft / 60 / 60 / 1000) % 1) * 60,
    };

    const doneWithWork = utils.addTime(difference, timeLeftAtWork);
    result.proposedBreakEndTime = difference;
    result.proposedEndTime = doneWithWork;
  }

  // Clock out
  if (rows.clock_in && rows.break_in && rows.break_out && !rows.clock_out) {
    result.nextAction = "Clock Out";
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
      result.proposedEndTime = utils.addTime(now, timeLeftAtWork);
    } else {
      result.overtimeStatus = true;
      result.overtimeWorked = overtime(
        rows.clock_in,
        rows.break_in,
        rows.break_out,
        utils.dateTimeToTime(new Date()),
      );
    }
  }
  // Done
  if (rows.clock_in && rows.break_in && rows.break_out && rows.clock_out) {
    result.nextAction = "Done for the day :)";
    result.overtimeStatus = true;
    result.overtimeWorked = overtime(
      rows.clock_in,
      rows.break_in,
      rows.break_out,
      rows.clock_out,
    );
  }
  return result;
};

exports.getIndex = async (req, res, next) => {
  const rows = await timesheetsModel.selectDay(utils.todayIso(), req.username);
  const options = calculateTime(rows);
  options.username = req.username;
  res.render("timesheets/index", { ...options });
};

exports.postEnter = async (req, res, next) => {
  if (req.body.action) {
    const now = new Date();
    const username = req.username;
    const existing = await timesheetsModel.selectDay(utils.todayIso(), username);

    switch (req.body.action) {
      case "Clock In":
        timesheetsModel.insertClockIn(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Break In":
        if (!existing) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' yet` });
          break;
        }
        timesheetsModel.updateBreakStart(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Break End":
        if (!existing) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' yet` });
          break;
        } else if (!existing.break_in) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' before 'Break In'` });
          break;
        }
        timesheetsModel.updateBreakEnd(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Clock Out":
        if (!existing) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' yet` });
          break;
        }
        timesheetsModel.updateClockOut(now, username, utils.dateTimeToTime(now));
        res.redirect("/timesheet");
        break;
      case "Done for the day :)":
        res.redirect("https://youtu.be/kxSOhBdwmc4?t=1");
        break;
      default:
        next({ statusCode: 400, msg: "Invalid action" });
        break;
    }
  } else {
    next({ statusCode: 400, msg: "Empty payload" });
  }
};

exports.getView = async (req, res, next) => {
  const options = {};
  options.username = req.username;
  options.date = req.query.date ? req.query.date : utils.todayIso();

  const entry = await timesheetsModel.selectDay(options.date, req.username);

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

exports.getEdit = async (req, res, next, message = null) => {
  const options = {};
  options.username = req.username;
  options.date = req.query.date ? req.query.date : utils.todayIso();

  const entry = await timesheetsModel.selectDay(options.date, req.username);

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
  if (message) options.alert = message;
  res.render("timesheets/edit", { ...options });
};

exports.postEdit = async (req, res, next) => {
  const args = req.body;
  const username = req.username;
  if (!args.date) res.sendStatus(400);

  const hasEntryYet = await timesheetsModel.selectDay(args.date, username);

  // Using update when no entry exists yet will just not write - use insert instead
  if (!hasEntryYet && args.clock_in) {
    if (utils.isShortTime(args.clock_in)) {
      await timesheetsModel.insertClockIn(args.date, username, args.clock_in);
      res.redirect(`/timesheet/edit?date=${args.date}`);
      return;
    } else {
      res.sendStatus(400);
      return;
    }
  }

  // Trying to insert anything before clock in
  if (!hasEntryYet && !args.clock_in) {
    this.getEdit(req, res, next, "Can't insert times when no 'Clock In' is set");
    return;
  }

  // Trying to insert break end with no break in
  if (!hasEntryYet.break_in && args.break_out) {
    this.getEdit(req, res, next, "Can't insert 'Break End' when no 'Break Start' is set");
    return;
  }

  // Validation complete - just update values
  if (args.clock_in) {
    if (utils.isShortTime(args.clock_in)) {
      await timesheetsModel.updateClockIn(args.date, username, args.clock_in);
    } else {
      res.sendStatus(400);
      return;
    }
  } else if (args.break_in)
    if (utils.isShortTime(args.break_in)) {
      await timesheetsModel.updateBreakStart(args.date, username, args.break_in);
    } else {
      res.sendStatus(400);
      return;
    }
  else if (args.break_out)
    if (utils.isShortTime(args.break_out)) {
      await timesheetsModel.updateBreakEnd(args.date, username, args.break_out);
    } else {
      res.sendStatus(400);
      return;
    }
  else if (args.clock_out) {
    if (utils.isShortTime(args.clock_out)) {
      await timesheetsModel.updateClockOut(args.date, username, args.clock_out);
    } else {
      res.sendStatus(400);
      return;
    }
  } else res.sendStatus(400);

  res.redirect(`/timesheet/edit?date=${args.date}`);
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
