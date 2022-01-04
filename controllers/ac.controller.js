const acModel = require("../models/ac.model");

exports.getAnimalCrossing = (_, res, next) => {
  res.render("ac/index", { host: "http://127.0.0.1:9090" });
};
