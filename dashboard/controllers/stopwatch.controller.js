const stopwatchModel = require("../models/stopwatch.model.js");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.username;
  options.total = "8 hours 21 minutes";
  options.lastEdit = "14:25";
  options.nextAction = "Next Action";
  options.dayAction = "End day";

  const exiting = await stopwatchModel.readByDate(req.username, new Date());
  if (exiting.length === 0) {
    options.total = "Not started";
    options.lastEdit = "n/a";
    options.nextAction = "START";
    options.nextActionText = "Start day";
    options.dayAction = "START";
    options.dayActionText = "Start day";
  } else {
    const last = exiting[exiting.length - 1];

    if (last.action === "START") {
      options.nextAction = "STOP";
      options.nextActionText = "Pause";
      options.dayAction = "END";
      options.dayActionText = "End day";
    }

    if (last.action === "STOP") {
      options.nextAction = "CONT";
      options.nextActionText = "Continue";
      options.dayAction = "END";
      options.dayActionText = "End day";
    }

    if (last.action === "CONT") {
      options.nextAction = "STOP";
      options.nextActionText = "Pause";
      options.dayAction = "END";
      options.dayActionText = "End day";
    }

    if (last.action) options.total = "Loading";
    options.lastEdit = last.timestamp.substring(0, 5);
  }

  res.render("stopwatch/index", { ...options });
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
