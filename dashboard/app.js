require("./utils/log.utils");
import BinUtils from "./utils/bin.utils";
import validateUser from "./middleware/user.middleware";

const express = require("express");
const error = require("./controllers/error.controller");
const timesheetRouter = require("./routers/timesheet.router");
const stopwatchRouter = require("./routers/stopwatch.router.js");
const pokemonRouter = require("./routers/pokemon.router.js");
const userRouter = require("./routers/user.router");
const energyRouter = require("./routers/energy.router");
const energyUtils = require("./utils/energy.utils");

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
app.use("/energy", energyRouter);

app.get("/", validateUser, async (req, res, next) => {
  const options = {};
  options.host = ``;
  options.username = req.username;

  await energyUtils.updateReadings();
  const energyInfo = await energyUtils.fetchLatestDay();
  options.energyInfo = energyInfo;

  const binDates = await BinUtils.getBinDates();

  options.blackBinDay = binDates.BlackDay;
  options.blackBinDate =
    binDates.BlackDate !== "Loading..."
      ? binDates.BlackDate.toLocaleDateString("en-GB")
      : "Loading...";
  options.greenBinDay = binDates.GreenDay;
  options.greenBinDate =
    binDates.GreenDate !== "Loading..."
      ? binDates.GreenDate.toLocaleDateString("en-GB")
      : "Loading...";

  res.render(`home/${req.headers["x-username"]}`, { ...options });
});

app.all("/", error.methodNotAllowed);

app.use((err, _, res, next) => {
  if (err) {
    error.handleErrors(res, err);
  } else next(err);
});

export default app;
module.exports = app;
