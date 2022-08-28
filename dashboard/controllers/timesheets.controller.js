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
    now.getHours() + 8,
    now.getMinutes() + 30,
  );
  return indexObject(new Date(), "Clock In", proposedEndTime);
};

const viewBreakIn = (rows) => {
  const now = new Date();
  const proposedEndTime = timesheetUtils.copyDate(rows.clock_in);
  proposedEndTime.setHours(proposedEndTime.getHours() + 8);
  proposedEndTime.setMinutes(proposedEndTime.getMinutes() + 30);
  let overtimeWorked = false;

  if (proposedEndTime < now) {
    const hours = Math.trunc((now - proposedEndTime) / 60 / 60 / 1000);
    const minutes = Math.trunc((((now - proposedEndTime) / 60 / 60 / 1000) % 1) * 60);
    overtimeWorked = `+${hours >= 1 ? hours + "h" : ""}${minutes}min`;
  }
  return indexObject(now, "Break In", proposedEndTime, false, overtimeWorked);
};

const viewBreakEnd = (rows) => {
  const clockIn = rows.clock_in;
  const breakIn = rows.break_in;
  let minutesWorked = (breakIn - clockIn) / 60000;
  const hoursWorked = Math.trunc(minutesWorked / 60);
  minutesWorked = minutesWorked - hoursWorked * 60;

  let overtimeWorked = false;

  const proposedBreakEndTime = timesheetUtils.copyDate(breakIn);
  proposedBreakEndTime.setHours(breakIn.getHours() + 1);
  const proposedEndTime = timesheetUtils.copyDate(proposedBreakEndTime);

  proposedEndTime.setHours(proposedEndTime.getHours() + (6 - hoursWorked));
  proposedEndTime.setMinutes(proposedEndTime.getMinutes() + (30 - minutesWorked));

  return indexObject(
    new Date(),
    "Break End",
    proposedEndTime,
    proposedBreakEndTime,
    overtimeWorked,
  );
};

const viewClockOut = (rows) => {
  const clockIn = rows.clock_in;
  const breakIn = rows.break_in;
  const breakEnd = rows.break_out;

  const timeWorked = timesheetUtils.timeWorked(
    rows.clock_in,
    rows.break_in,
    rows.break_out,
    new Date(),
  );

  const minutesWorked = Math.trunc(timeWorked / 60000);
  const proposedEndTime = new Date();
  const minutesLeft = 8 * 60 + 30 - minutesWorked;
  let overtimeWorked = false;

  proposedEndTime.setMinutes(new Date().getMinutes() + (minutesLeft % 60));
  proposedEndTime.setHours(new Date().getHours() + Math.trunc(minutesLeft / 60));

  let sign = "-";
  let displayHours = false;
  if (minutesLeft > 60 || minutesLeft <= -60) displayHours = true;

  if (minutesLeft <= 0) {
    sign = "+";
    overtimeWorked =
      sign +
      `${displayHours ? Math.abs(Math.trunc(minutesLeft / 60)) + "h" : ""}${Math.abs(
        minutesLeft,
      )}min`;
  }

  return indexObject(new Date(), "Clock Out", proposedEndTime, breakEnd, overtimeWorked);
};

const viewDone = (rows) => {
  const clockIn = rows.clock_in;
  const breakIn = rows.break_in;
  const breakEnd = rows.break_out;
  const clockOut = rows.clock_out;

  const timeWorked = timesheetUtils.timeWorked(
    rows.clock_in,
    rows.break_in,
    rows.break_out,
    new Date(),
  );

  const minutesWorked = Math.trunc(timeWorked / 60000);
  const minutesLeft = 7 * 60 + 30 - minutesWorked;
  const hoursLeft = Math.trunc(minutesLeft / 60);

  const sign = minutesLeft <= 0 ? "+" : "-";
  const displayHours = hoursLeft > 0 ? true : false;
  const overtime = (overtimeWorked =
    sign + `${displayHours ? Math.abs(hoursLeft) + "h" : ""}${Math.abs(minutesLeft)}min`);

  return indexObject(new Date(), "Done for the day :)", clockOut, breakEnd, overtime);
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
  const rows = await timesheetsModel.selectDay(new Date(), req.username);
  const options = calculateTime(rows);
  options.username = req.username;
  res.render("timesheets/index", { ...options });
};

exports.postEnter = async (req, res, next) => {
  if (req.body.action) {
    const now = new Date();
    const username = req.username;
    const existing = await timesheetsModel.selectDay(now, username);

    switch (req.body.action) {
      case "Clock In":
        timesheetsModel.insertClockIn(now, username);
        res.redirect("/timesheet");
        break;
      case "Break In":
        if (!existing) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' yet` });
          break;
        }
        timesheetsModel.updateBreakStart(now, username, now);
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
        timesheetsModel.updateBreakEnd(now, username, now);
        res.redirect("/timesheet");
        break;
      case "Clock Out":
        if (!existing) {
          next({ statusCode: 400, msg: `Can't '${req.body.action}' yet` });
          break;
        }
        timesheetsModel.updateClockOut(now, username, now);
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
  options.date = req.query.date
    ? timesheetUtils.constructUTCDateTime(new Date(req.query.date), "12:00:00")
    : new Date();

  const entry = await timesheetsModel.selectDay(options.date, req.username);

  if (entry) {
    options.clock_in = entry.clock_in;
    options.break_in = entry.break_in ? entry.break_in : null;
    options.break_out = entry.break_out ? entry.break_out : null;
    options.clock_out = entry.clock_out ? entry.clock_out : null;

    const timeWorked = timesheetUtils.timeWorked(
      options.clock_in,
      options.break_in,
      options.break_out,
      options.clock_out,
    );

    const difference = -Math.abs(7.5 * 60 * 60 * 1000 - timeWorked) / 1000;
    const sign = difference >= 0 ? "+" : "-";
    let minutes;
    if (sign === "+") minutes = 60 - Math.ceil((Math.abs(difference) / 60) % 60);
    else minutes = 60 - Math.floor(Math.abs(difference / 60) % 60);
    const hours = Math.floor(Math.abs(difference / 60 / 60));
    options.difference = `${sign}${hours ? hours + "h" : ""} ${minutes}min`;
    if (!options.clock_out) options.alert = "Day not completed yet";
  }

  res.render("timesheets/view", { ...options });
};

exports.getEdit = async (req, res, next, message = null) => {
  const options = {};
  options.username = req.username;
  options.date = req.query.date ? new Date(req.query.date) : new Date();

  const entry = await timesheetsModel.selectDay(options.date, req.username);
  if (entry) {
    options.clock_in = entry.clock_in;
    options.break_in = entry.break_in ? entry.break_in : null;
    options.break_out = entry.break_out ? entry.break_out : null;
    options.clock_out = entry.clock_out ? entry.clock_out : null;

    if (!options.clock_out) options.alert = "Day not completed yet";
  }
  if (message) options.alert = message;
  res.render("timesheets/edit", { ...options });
};

exports.postEdit = async (req, res, next) => {
  const args = req.body;
  const username = req.username;
  if (!args.date) res.sendStatus(400);

  const hasEntryYet = await timesheetsModel.selectDay(new Date(args.date), username);

  // Using update when no entry exists yet will just not write - use insert instead
  if (!hasEntryYet && args.clock_in) {
    if (generalUtils.isShortTime(args.clock_in)) {
      const insertClockInTime = new Date(args.date);
      insertClockInTime.setHours(args.clock_in.split(":")[0]);
      insertClockInTime.setMinutes(args.clock_in.split(":")[1]);
      await timesheetsModel.insertClockIn(insertClockInTime, username);
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
      const updateClockInTime = new Date(args.date);
      updateClockInTime.setHours(args.clock_in.split(":")[0]);
      updateClockInTime.setMinutes(args.clock_in.split(":")[1]);

      await timesheetsModel.updateClockIn(updateClockInTime, username);
    } else {
      res.sendStatus(400);
      return;
    }
  } else if (args.break_in)
    if (generalUtils.isShortTime(args.break_in)) {
      const updateBreakStartTime = new Date(args.date);
      updateBreakStartTime.setHours(args.break_in.split(":")[0]);
      updateBreakStartTime.setMinutes(args.break_in.split(":")[1]);

      await timesheetsModel.updateBreakStart(updateBreakStartTime, username);
    } else {
      res.sendStatus(400);
      return;
    }
  else if (args.break_out)
    if (generalUtils.isShortTime(args.break_out)) {
      const updateBreakOutTime = new Date(args.date);
      updateBreakOutTime.setHours(args.break_out.split(":")[0]);
      updateBreakOutTime.setMinutes(args.break_out.split(":")[1]);
      await timesheetsModel.updateBreakEnd(updateBreakOutTime, username);
    } else {
      res.sendStatus(400);
      return;
    }
  else if (args.clock_out) {
    if (generalUtils.isShortTime(args.clock_out)) {
      const updateClockOut = new Date(args.date);
      updateClockOut.setHours(args.clock_out.split(":")[0]);
      updateClockOut.setMinutes(args.clock_out.split(":")[1]);
      await timesheetsModel.updateClockOut(updateClockOut, username);
    } else {
      res.sendStatus(400);
      return;
    }
  } else res.sendStatus(400);

  res.redirect(`/timesheet/edit?date=${args.date}`);
};
