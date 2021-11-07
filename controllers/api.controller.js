const utils = require("../utils");

exports.getRoot = (_, res, next) => {
  res.render("index", { host: "http://192.168.0.18:9090" });
};
