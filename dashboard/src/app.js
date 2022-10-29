require("./utils/log.utils");
import BinUtils from "./utils/bin.utils";
import validateUser from "./middleware/user.middleware";

const express = require("express");
const error = require("./controllers/error.controller");
const timesheetRouter = require("./routers/timesheet.router");
const stopwatchRouter = require("./routers/stopwatch.router");
const pokemonRouter = require("./routers/pokemon.router");
const userRouter = require("./routers/user.router");
const energyRouter = require("./routers/energy.router");
const energyUtils = require("./utils/energy.utils").default;

const app = express();
app.set("view engine", "pug");
app.use("/static", express.static(`${__dirname}/public`));
app.set("views", `${__dirname}/views`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/timesheet", timesheetRouter);
app.use("/stopwatch", stopwatchRouter.default);
app.use("/pokemon", pokemonRouter.default);
app.use("/user", userRouter.default);
app.use("/energy", energyRouter.default);

app.get("/", validateUser, async (req, res, next) => {
  const options = {};
  options.host = ``;
  options.username = req.headers["x-username"];

  energyUtils.updateReadings();
  const energyInfo = await energyUtils.latestDailySummary();
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
