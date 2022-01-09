const express = require("express");
const error = require("./controllers/error.controller");
const timesheetRouter = require("./routers/timesheets.router.js");
const acRouter = require("./routers/ac.router.js");
const pokemonRouter = require("./routers/pokemon.router.js");

const app = express();
app.set("view engine", "pug");
app.use("/static", express.static("public"));
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/timesheet", timesheetRouter);
app.use("/ac", acRouter);
app.use("/pokemon", pokemonRouter);

app.get("/", (_, res, next) => {
  res.render("index.pug", { host: `` });
});

app.all("/", error.methodNotAllowed);

app.use((err, _, res, next) => {
  if (err) {
    error.handleErrors(res, err);
  } else next(err);
});

module.exports = app;
