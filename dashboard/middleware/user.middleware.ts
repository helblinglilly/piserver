import express from "express";
import UserModel from "../models/user.model";

export async function validateUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const ip: string =
    req.headers["x-forwarded-for"].toString() || req.socket.remoteAddress;

  const username = await UserModel.selectUser(ip);

  if (!username) {
    res = res as any;
    res.render("user/select");
  }

  req.headers["x-username"] = username;
  next();
}

export default validateUser;
