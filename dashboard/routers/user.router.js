const userRouter = require("express").Router();
const error = require("../controllers/error.controller");
const userModel = require("../models/user.model");

userRouter.post("/select", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const username = req.body.username;
  userModel.insertUser(ip, username);
  res.redirect(302, "/timesheet");
});

userRouter.all("/select", error.methodNotAllowed);

userRouter.all("/*", error.pageNotFound);

module.exports = userRouter;
