const userRouter = require("express").Router();
import error from "../controllers/error.controller";
import userModel from "../models/user.model";

userRouter.post("/select", (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const username = req.body.username;
  userModel.insertUser(ip, username);
  res.redirect(301, req.headers.referer);
});

userRouter.all("/select", error.methodNotAllowed);

userRouter.all("/*", error.pageNotFound);

export default userRouter;
