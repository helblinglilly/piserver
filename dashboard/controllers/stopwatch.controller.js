const stopwatchModel = require("../models/stopwatch.model.js");
const timesheetUtils = require("../utils/timesheet.utils");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.username;

  const existing = await stopwatchModel.readByDate(
    req.username,
    timesheetUtils.constructUTCDateTime(new Date()),
  );
  if (existing.length === 0) {
    options.total = "Not started";
    options.nextAction = "START";
    options.nextActionText = "Start day";
    options.dayAction = "START";
    options.dayActionText = "Start day";
  } else {
    const last = existing[existing.length - 1];

    if (last.action === "START") {
      options.nextAction = "STOP";
      options.nextActionText = "Pause";
    }

    if (last.action === "STOP") {
      options.nextAction = "CONT";
      options.nextActionText = "Continue";
    }

    if (last.action === "CONT") {
      options.nextAction = "STOP";
      options.nextActionText = "Pause";
    }

    if (last.action !== "END") {
      options.dayAction = "END";
      options.dayActionText = "End day";
    }
    if (last.action) options.total = "Loading";
    console.log(last);
    options.lastEdit = last.timestamp;
  }
  options.elapsed = calculateTimeElapsed(existing);

  console.log(options);
  res.render("stopwatch/index", { ...options });
};

exports.getView = async (req, res, next) => {
  res.send(200);
};

exports.start = async (req, res, next) => {
  await stopwatchModel.insert(req.username, new Date(), "START");
  res.redirect("/stopwatch");
};

exports.stop = async (req, res, next) => {
  await stopwatchModel.insert(req.username, new Date(), "STOP");
  res.redirect("/stopwatch");
};

exports.cont = async (req, res, next) => {
  await stopwatchModel.insert(req.username, new Date(), "CONT");
  res.redirect("/stopwatch");
};

exports.end = async (req, res, next) => {
  await stopwatchModel.insert(req.username, new Date(), "END");
  res.redirect("/stopwatch");
};

const calculateTimeElapsed = (arr) => {
  let previousTimestamp = new Date();
  let sum = new Date();
  previousTimestamp.setHours(0);
  previousTimestamp.setMinutes(0);
  previousTimestamp.setSeconds(0);
  sum.setHours(0);
  sum.setMinutes(0);
  sum.setSeconds(0);

  for (const entry of arr) {
    const segments = entry.timestamp.split(":");
    const hours = Number.parseInt(segments[0]);
    const minutes = Number.parseInt(segments[1]);
    const seconds = Number.parseInt(segments[2]);

    if (["STOP", "END"].includes(entry.action)) {
      // Add current timestamp to sum
      sum.setHours(sum.getHours() + (hours - previousTimestamp.getHours()));
      sum.setMinutes(sum.getMinutes() + (minutes - previousTimestamp.getMinutes()));
      sum.setSeconds(sum.getSeconds() + (seconds - previousTimestamp.getSeconds()));
    } else if (["START", "CONT"].includes(entry.action)) {
      // Set the previous timestamp to this (START or CONT)
      previousTimestamp.setHours(hours);
      previousTimestamp.setMinutes(minutes);
      previousTimestamp.setSeconds(seconds);
    }
  }
  return sum;
};
