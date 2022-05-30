const express = require("express");
const error = require("./controllers/error.controller");
const timesheetRouter = require("./routers/timesheets.router.js");
const stopwatchRouter = require("./routers/stopwatch.router.js");
const pokemonRouter = require("./routers/pokemon.router.js");
const userRouter = require("./routers/user.router");
const apiRouter = require("./routers/api.router");
const userSelection = require("./middleware/user.middleware");

const app = express();
app.set("view engine", "pug");
app.use("/static", express.static("public"));
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/timesheet", timesheetRouter);
app.use("/stopwatch", stopwatchRouter);
app.use("/pokemon", pokemonRouter);
app.use("/user", userRouter);
app.use("/api", apiRouter);

app.get("/", userSelection, (req, res, next) => {
  res.render("home/index", { host: ``, username: req.username });
});

app.all("/", error.methodNotAllowed);

app.use((err, _, res, next) => {
  if (err) {
    error.handleErrors(res, err);
  } else next(err);
});

module.exports = app;
