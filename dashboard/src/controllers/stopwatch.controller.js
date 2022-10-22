const { default: dateUtils } = require("../utils/date.utils");
const stopwatchModel = require("../models/stopwatch.model");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.headers["x-username"];

  const existingEntry = await stopwatchModel.readByDate(
    req.headers["x-username"],
    dateUtils.constructUTCDateFromLocal(new Date()),
  );

  if (existingEntry.length === 0) {
    options.nextAction = "START";
    options.nextActionText = "Start day";
    options.dayAction = "START";
    options.dayActionText = "Start day";
  } else {
    const last = existingEntry[0];

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

    options.lastEdit = last.timestamp;
  }
  options.elapsed = calculateTimeElapsed(existingEntry);
  options.payloadTimestamp = new Date();
  res.render("stopwatch/index", { ...options });
};

exports.getView = async (req, res, next) => {
  res.send(200);
};

exports.start = async (req, res, next) => {
  await stopwatchModel.insert(req.headers["x-username"], new Date(), "START");
  res.redirect("/stopwatch");
};

exports.stop = async (req, res, next) => {
  await stopwatchModel.insert(req.headers["x-username"], new Date(), "STOP");
  res.redirect("/stopwatch");
};

exports.cont = async (req, res, next) => {
  await stopwatchModel.insert(req.headers["x-username"], new Date(), "CONT");
  res.redirect("/stopwatch");
};

exports.end = async (req, res, next) => {
  await stopwatchModel.insert(req.headers["x-username"], new Date(), "END");
  res.redirect("/stopwatch");
};

const calculateTimeElapsed = (arr) => {
  // arr is coming in with the latest entries at the start. [0] = most recent, [n] = oldest
  let sum = new Date(0); // sum should be a plain count of hh/mm/ss
  let previousTimestamp = new Date(); // If the only entry is START we need to subtract from NOW

  for (const entry of arr) {
    // Work out how much time has passed since the last entry
    const millisecondDifference = previousTimestamp - entry.timestamp;
    const seconds = Math.floor(millisecondDifference / 1000) % 60;
    const minutes = Math.floor(millisecondDifference / 1000 / 60);
    const hours = Math.floor(millisecondDifference / 1000 / 60 / 60);

    // Only increase the sum if we are currently adding time
    if (["START", "CONT"].includes(entry.action)) {
      sum.setHours(sum.getHours() + hours);
      sum.setMinutes(sum.getMinutes() + minutes);
      sum.setSeconds(sum.getSeconds() + seconds);
    }

    previousTimestamp = entry.timestamp;
  }
  return sum;
};
