const setup = require("../setup");
const acModel = require("../models/ac.model");

exports.getAnimalCrossing = (_, res, next) => {
  res.render("ac/index", { host: setup.HOST });
};
