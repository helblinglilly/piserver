const utils = require("../utils");
const acModel = require("../models/ac.model");

exports.getRoot = (_, res, next) => {
  res.sendFile(utils.views() + "ac/index.html");
};

exports.getFish = (req, res, next) => {
  if (req.query.name === undefined)
    res.sendFile(utils.views() + "ac/fish.html");
  else {
    acModel.GetFishDetails(req.query.name);
  }
  // http://acnhapi.com/v1/fish/{fishID}
};

exports.getFishById = (req, res, next) => {};
