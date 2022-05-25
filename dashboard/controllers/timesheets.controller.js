const timesheetsModel = require("../models/timsheets.model");
const timesheetUtils = require("../utils/timesheet.utils");
const generalUtils = require("../utils.js");

const indexObject = (
  day,
  nextAction,
  proposedEndTime,
  proposedBreakEndTime = false,
  overtimeWorked = false,
) => {
  const result = {};
  result.day = day.toISOString().split("T")[0];
  result.nextAction = nextAction;
  result.proposedEndTime = proposedEndTime;
  result.proposedBreakEndTime = proposedBreakEndTime ? proposedBreakEndTime : null;
  result.overtimeWorked = overtimeWorked;
  result.overtimeStatus = overtimeWorked ? true : false;
  return result;
};

const viewClockIn = () => {
  const now = new Date();
  const proposedEndTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours() + 7,
    now.getMinutes() + 30,
  );
  return indexObject(new Date(), "Clock In", proposedEndTime);
};

const viewBreakIn = (rows) => {
  const now = new Date();
  const clockIn = timesheetUtils.buildDateWithTime(rows.day_date, rows.clock_in);
  const proposedEndTime = timesheetUtils.buildBaseDate(rows.day_date);
  let overtimeWorked = false;

  proposedEndTime.setHours(clockIn.getHours() + 8);
  proposedEndTime.setMinutes(clockIn.getMinutes() + 30);

  if (proposedEndTime < now) {
    const hours = Math.trunc((now - proposedEndTime) / 60 / 60 / 1000);
    const minutes = Math.trunc((((now - proposedEndTime) / 60 / 60 / 1000) % 1) * 60);
    overtimeWorked = `+${hours >= 1 ? hours + "h" : ""}${minutes}min`;
  }
  return indexObject(new Date(), "Break In", proposedEndTime, false, overtimeWorked);
};

const viewBreakEnd = (rows) => {
  const clockIn = timesheetUtils.buildDateWithTime(rows.day_date, rows.clock_in);
  const breakIn = timesheetUtils.buildDateWithTime(rows.day_date, rows.break_in);
  const timeWorked = new Date(breakIn - clockIn);
  const proposedBreakEndTime = new Date(breakIn);
  const proposedEndTime = timesheetUtils.buildBaseDate(rows.day_date);
  let overtimeWorked = false;

  proposedBreakEndTime.setHours(breakIn.getHours() + 1);
  proposedEndTime.setHours(proposedBreakEndTime.getHours() + timeWorked.getHours());
  proposedEndTime.setMinutes(proposedBreakEndTime.getMinutes() + timeWorked.getMinutes());

  if (timeWorked.getHours() >= 7 && timeWorked.getMinutes() >= 30) {
    const hours = timeWorked.getHours() - 7;
    const minutes = timeWorked.getMinutes() - 30;
    overtimeWorked = `+${hours >= 1 ? hours + "h" : ""}${minutes}min`;
  }

  return indexObject(
    new Date(),
    "Break End",
    proposedEndTime,
    proposedBreakEndTime,
    overtimeWorked,
  );
};

const viewClockOut = (rows) => {
  const clockIn = timesheetUtils.buildDateWithTime(rows.day_date, rows.clock_in);
  const breakIn = timesheetUtils.buildDateWithTime(rows.day_date, rows.break_in);
  const breakEnd = timesheetUtils.buildDateWithTime(rows.day_date, rows.break_out);
  const timeWorked = new Date(breakIn - clockIn + (new Date() - breakEnd));
  const proposedEndTime = timesheetUtils.buildBaseDate(rows.day_date);
  let overtimeWorked = false;

  const hoursLeft = 8 - timeWorked.getHours();
  const minutesLeft = 30 - timeWorked.getMinutes();

  proposedEndTime.setMinutes(new Date().getMinutes() + minutesLeft);
  proposedEndTime.setHours(new Date().getHours() + hoursLeft);

  if (hoursLeft <= 0 || minutesLeft <= 0) {
    overtimeWorked = `+${Math.abs(hoursLeft) >= 1 ? Math.abs(hoursLeft) + "h" : ""}${
      minutesLeft <= 0 ? Math.abs(minutesLeft) + 30 : Math.abs(minutesLeft)
    }min`;
  }

  return indexObject(new Date(), "Clock Out", proposedEndTime, breakEnd, overtimeWorked);
};

const viewDone = (rows) => {
  const clockIn = timesheetUtils.buildDateWithTime(rows.day_date, rows.clock_in);
  const breakIn = timesheetUtils.buildDateWithTime(rows.day_date, rows.break_in);
  const breakEnd = timesheetUtils.buildDateWithTime(rows.day_date, rows.break_out);
  const clockOut = timesheetUtils.buildDateWithTime(rows.day_date, rows.clock_out);
  const timeWorked = new Date(breakIn - clockIn + (clockOut - breakEnd));
  const totalThreshold = 7 * 60 + 30;
  const totalMinutesWorked = timeWorked.getHours() * 60 + timeWorked.getMinutes();
  let overtimeWorked = false;

  const sign = totalMinutesWorked > totalThreshold ? "+" : "-";
  const hours =
    timeWorked.getHours() - 8 === 0 ? "" : `${Math.abs(timeWorked.getHours() - 8)}h`;
  const minutes = `${Math.abs(timeWorked.getMinutes() - 30)}min`;
  overtimeWorked = `${sign}${hours}${minutes}`;

  console.log(overtimeWorked);
  return indexObject(
    new Date(),
    "Done for the day :)",
    clockOut,
    breakEnd,
    overtimeWorked,
  );
};

const calculateTime = (rows) => {
  if (!rows) return viewClockIn();

  if (rows.clock_in && !rows.break_in && !rows.break_out && !rows.clock_out)
    return viewBreakIn(rows);

  if (rows.clock_in && rows.break_in && !rows.break_out && !rows.clock_out)
    return viewBreakEnd(rows);

  if (rows.clock_in && rows.break_in && rows.break_out && !rows.clock_out)
    return viewClockOut(rows);

  if (rows.clock_in && rows.break_in && rows.break_out && rows.clock_out)
    return viewDone(rows);
};

exports.getIndex = async (req, res, next) => {
  const rows = await timesheetsModel.selectDay(generalUtils.todayIso(), req.username);
  const options = calculateTime(rows);
  options.username = req.username;
  console.log(options);
  res.render("timesheets/index", { ...options });
};

exports.postEnter = async (req, res, next) => {
  if (req.body.action) {
    const now = new Date();
    const username = req.username;
    const existing = await timesheetsModel.selectDay(generalUtils.todayIso(), username);

    switch (req.body.action) {
      case "Clock In":
        timesheetsModel.insertClockIn(
          now,
          username,
          generalUtils.dateTimetoHourMinute(now),
        );
        res.redirect("/timesheet");
        break;
      case "Break In":
        if (!existing) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' yet` });
          break;
        }
        timesheetsModel.updateBreakStart(
          now,
          username,
          generalUtils.dateTimetoHourMinute(now),
        );
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
        timesheetsModel.updateBreakEnd(
          now,
          username,
          generalUtils.dateTimetoHourMinute(now),
        );
        res.redirect("/timesheet");
        break;
      case "Clock Out":
        if (!existing) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' yet` });
          break;
        }
        timesheetsModel.updateClockOut(
          now,
          username,
          generalUtils.dateTimetoHourMinute(now),
        );
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
  options.date = req.query.date ? req.query.date : generalUtils.todayIso();

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
  options.date = req.query.date ? req.query.date : generalUtils.todayIso();

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
    if (generalUtils.isShortTime(args.clock_in)) {
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
    if (generalUtils.isShortTime(args.clock_in)) {
      await timesheetsModel.updateClockIn(args.date, username, args.clock_in);
    } else {
      res.sendStatus(400);
      return;
    }
  } else if (args.break_in)
    if (generalUtils.isShortTime(args.break_in)) {
      await timesheetsModel.updateBreakStart(args.date, username, args.break_in);
    } else {
      res.sendStatus(400);
      return;
    }
  else if (args.break_out)
    if (generalUtils.isShortTime(args.break_out)) {
      await timesheetsModel.updateBreakEnd(args.date, username, args.break_out);
    } else {
      res.sendStatus(400);
      return;
    }
  else if (args.clock_out) {
    if (generalUtils.isShortTime(args.clock_out)) {
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

  clock_in = generalUtils.constructUTCDateTime(new Date(), clock_in);
  clock_out = generalUtils.constructUTCDateTime(new Date(), clock_out);

  let timeWorked = 0;
  if (!break_in && !break_out) {
    timeWorked = clock_out - clock_in;
  } else {
    break_in = generalUtils.constructUTCDateTime(new Date(), break_in);
    break_out = generalUtils.constructUTCDateTime(new Date(), break_out);
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
