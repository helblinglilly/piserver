const express = require("express");
const setup = require("./setup");
const error = require("./controllers/error.controller");
const timesheetRouter = require("./routers/timesheets.router.js");
const acRouter = require("./routers/ac.router.js");
const pokemonRouter = require("./routers/pokemon.router.js");

const app = express();
app.set("view engine", "pug");
app.use("/static", express.static("public"));
app.set("views", "./views");
app.use(express.json());

app.use("/timesheet", timesheetRouter);
app.use("/ac", acRouter);
app.use("/pokemon", pokemonRouter);

app.get("/", (_, res, req) => {
  res.render("index.pug", { host: `` });
});

app.all("/", error.methodNotAllowed);

module.exports = app;
