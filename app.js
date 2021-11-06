const express = require("express");
const apiRouter = require("./routers/api.router");
const acRouter = require("./routers/ac.router");
const path = require("path");

const app = express();
app.use("/static", express.static("public"));
app.use(express.json());

app.use("/", apiRouter);
app.use("/ac", acRouter);
module.exports = app;
