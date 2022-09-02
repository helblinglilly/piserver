const utils = require("../utils");
const model = require("../models/energy.model");
const error = require("./error.controller");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.username;

  res.render("energy/index", { ...options });
};
