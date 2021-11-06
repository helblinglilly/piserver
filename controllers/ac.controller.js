const utils = require("../utils");

exports.getRoot = (_, res, next) => {
  res.sendFile(utils.views() + "ac/index.html");
};
