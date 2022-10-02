const model = require("../models/user.model");

async function validateUser(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const username = await model.default.selectUser(ip);

  if (!username) {
    res.render("user/select");
    return;
  }

  req.username = username;
  req.headers["x-username"] = username;
  next();
}

module.exports = validateUser;
