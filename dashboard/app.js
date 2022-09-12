const express = require("express");
const error = require("./controllers/error.controller");
const timesheetRouter = require("./routers/timesheets.router.js");
const stopwatchRouter = require("./routers/stopwatch.router.js");
const pokemonRouter = require("./routers/pokemon.router.js");
const userRouter = require("./routers/user.router");
const apiRouter = require("./routers/api.router");
const energyRouter = require("./routers/energy.router");
const userSelection = require("./middleware/user.middleware");
const energyUtils = require("./utils/energy.utils");
const binUtils = require("./utils/bin.utils");

const app = express();
app.set("view engine", "pug");
app.use("/static", express.static(`${__dirname}/public`));
app.set("views", "./views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/timesheet", timesheetRouter);
app.use("/stopwatch", stopwatchRouter);
app.use("/pokemon", pokemonRouter);
app.use("/user", userRouter);
app.use("/api", apiRouter);
app.use("/energy", energyRouter);

app.get("/", userSelection, async (req, res, next) => {
  const options = {};
  options.host = ``;
  options.username = req.username;

  await energyUtils.updateReadings();
  const energyInfo = await energyUtils.fetchLatestDay();
  options.energyInfo = energyInfo;

  const binDates = await binUtils.getBinDates();

  options.blackBinDay = binDates.BlackDay;
  options.blackBinDate = binDates.BlackDate;
  options.greenBinDay = binDates.GreenDay;
  options.greenBinDate = binDates.GreenDate;

  res.render(`home/${req.username}`, { ...options });
});

app.all("/", error.methodNotAllowed);

app.use((err, _, res, next) => {
  if (err) {
    error.handleErrors(res, err);
  } else next(err);
});

module.exports = app;
