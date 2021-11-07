const utils = require("../utils");
const acModel = require("../models/ac.model");

exports.getRoot = (_, res, next) => {
  res.render("ac/index", { host: "http://192.168.0.18:9090" });
};

exports.getFish = (req, res, next) => {
  if (req.query.name === undefined)
    res.render("ac/fish", { host: "http://192.168.0.18:9090" });
  else {
    acModel.GetFishDetails(req.query.name);
    res.render("index", { host: "http://192.168.0.18:9090" });
    // Filter the data. Update fish.pug to have placeholders or just create a new file and leave it there
  }
};

exports.getFishById = (req, res, next) => {};
