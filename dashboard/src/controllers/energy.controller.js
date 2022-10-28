const model = require("../models/energy.model").default;
const error = require("./error.controller");
const energy = require("../utils/energy.utils").default;

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.headers["x-username"];

  await energy.updateReadings();

  res.render("energy/index", { ...options });
};

exports.getViewHourly = async (req, res, next) => {
  const options = {};
  options.username = req.headers["x-username"];

  await energy.updateReadings();

  let mode = "";
  if (req.query.mode) {
    mode = req.query.mode.toLowerCase() === "electric" ? "electric" : "gas";
  } else mode = "gas";

  let startDate;
  let endDate;

  if (req.query.daily_date) {
    const timezoneOffset = new Date(req.query.daily_date).getTimezoneOffset() * 60000;

    startDate = new Date(new Date(req.query.daily_date) - timezoneOffset);
    startDate.setDate(startDate.getDate());

    endDate = new Date(startDate.toISOString());
    endDate.setDate(startDate.getDate() + 1);
  } else {
    if (mode === "gas") startDate = await model.selectLatestGasEntry();
    else startDate = await model.selectLatestElectricityEntry();

    endDate = new Date(startDate.toISOString());
    endDate.setDate(startDate.getDate() + 1);
  }

  const chartData = await energy.chartDataForDay(startDate, endDate, mode);

  options.date = startDate.toISOString().split("T")[0];
  options.mode = mode[0].toUpperCase() + mode.slice(1);
  options.otherMode = options.mode === "Electric" ? "Gas" : "Electric";
  options.hasData = chartData.data[chartData.data.length - 1] == undefined ? false : true;
  options.chart_data = JSON.stringify(chartData.chart);
  options.energy_used = chartData.energyUsed;
  options.energy_charged = chartData.charged;
  options.rate = chartData.rate;
  res.render("energy/view_hourly", { ...options });
};

exports.getBills = async (req, res, next) => {
  const options = {};
  options.username = req.headers["x-username"];

  let mode = "electric";
  if (req.query.mode.toLowerCase() === "gas") mode = "gas";

  let raw_data;
  if (mode === "electric") {
    raw_data = await model.selectEnergyBill();
  } else {
    raw_data = await model.selectGasBill();
  }

  const usageDataPoint = [];
  const standingDataPoint = [];
  const kWhDataPoint = [];
  const pricesDataPoint = [];
  const labels = [];

  raw_data.forEach((entry) => {
    usageDataPoint.push(parseFloat(entry.usage_kwh));
    standingDataPoint.push(parseFloat(entry.standing_order_rate));
    kWhDataPoint.push(parseFloat(entry.rate_kwh));
    pricesDataPoint.push(parseFloat(entry.after_tax));
    labels.push(entry.billing_end.toLocaleDateString("en-GB"));
  });

  let highestUsage = Math.max(usageDataPoint);
  let highestStandingCharge = Math.max(standingDataPoint);
  let highestkWhRate = Math.max(pricesDataPoint);
  let highestPrice = Math.max(pricesDataPoint);

  options.chart_usage_data = JSON.stringify({
    data: {
      labels: labels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: usageDataPoint,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            display: true,
            ticks: {
              suggestedMin: 0,
              suggestedMax: highestUsage + 10,
            },
          },
        ],
      },
      title: {
        display: true,
        text: "kWh usage at billing date",
      },
    },
  });

  options.chart_standing_charge_data = JSON.stringify({
    data: {
      labels: labels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: standingDataPoint,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            display: true,
            ticks: {
              suggestedMin: 0,
              suggestedMax: highestStandingCharge + 5,
            },
          },
        ],
      },
      title: {
        display: true,
        text: "Standing charge rate (pennies/day)",
      },
    },
  });

  options.chart_kwh_rate_data = JSON.stringify({
    data: {
      labels: labels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: kWhDataPoint,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            display: true,
            ticks: {
              suggestedMin: 0,
              suggestedMax: highestkWhRate + 5,
            },
          },
        ],
      },
      title: {
        display: true,
        text: "kWh unit rate",
      },
    },
  });

  options.chart_price_data = JSON.stringify({
    data: {
      labels: labels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: pricesDataPoint,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            display: true,
            ticks: {
              suggestedMin: 0,
              suggestedMax: highestPrice + 10,
            },
          },
        ],
      },
      title: {
        display: true,
        text: "Pounds charged",
      },
    },
  });

  options.mode = mode[0].toUpperCase() + mode.slice(1);
  options.otherMode = mode === "electric" ? "Gas" : "Electric";

  res.render("energy/bills", { ...options });
};

exports.getViewMonthly = async (req, res, next) => {
  const options = {};
  options.username = req.headers["x-username"];

  await energy.updateReadings();

  let mode = "";
  if (req.query.mode) {
    mode = req.query.mode.toLowerCase() === "electric" ? "electric" : "gas";
  } else mode = "gas";

  let startDate;
  let endDate;

  let selectedDate = req.query.daily_date
    ? new Date(req.query.daily_date)
    : await model.selectLatestElectricityBillDate();

  const billingDates = await model.selectStartEndBillDatesFromDate(selectedDate);

  const dayMilliseconds = 86400000;
  const timezoneOffset = new Date(selectedDate).getTimezoneOffset() * 60000;

  startDate = new Date(new Date(billingDates.billing_start) - timezoneOffset);
  endDate = new Date(
    new Date(billingDates.billing_end) - timezoneOffset + dayMilliseconds * 2,
  );

  const chartData = await energy.chartDataForDateRange(startDate, endDate, mode);

  endDate = new Date(new Date(endDate) - dayMilliseconds);

  options.date = endDate.toISOString().split("T")[0];
  options.mode = mode[0].toUpperCase() + mode.slice(1);
  options.otherMode = options.mode === "Electric" ? "Gas" : "Electric";
  options.hasData = chartData.data[chartData.data.length - 1] == undefined ? false : true;
  options.chart_data = JSON.stringify(chartData.chart);
  options.energy_used = chartData.energyUsed;
  options.energy_charged = chartData.charged;
  options.rate = chartData.rate;

  res.render("energy/view_monthly", { ...options });
};

exports.getInsertElectric = async (req, res, next) => {
  const options = {};
  options.username = req.headers["x-username"];
  res.render("energy/insert_electric", { ...options });
};

exports.getInsertGas = async (req, res, next) => {
  const options = {};
  options.username = req.headers["x-username"];
  res.render("energy/insert_gas", { ...options });
};

exports.postInsert = async (req, res, next) => {
  data = req.body;

  start_date = new Date(data.start_date);
  end_date = new Date(data.end_date);

  if (start_date > end_date) {
    res.sendStatus(400, "Start date can't be before end date");
    return;
  }

  standing_charge_days = parseInt(data.standing_charge_days);
  standing_charge_rate = parseFloat(data.standing_charge_rate);
  standing_charge = standing_charge_days * standing_charge_rate;

  units_used = parseFloat(data.units_used);
  unit_price = parseFloat(data.unit_price);
  energy_charge = units_used * unit_price;

  before_tax = standing_charge + energy_charge;
  after_tax = before_tax * 1.05;

  if (req.body.kind === "electric") {
    await model.insertElectricityBill(
      start_date,
      end_date,
      standing_charge_days,
      standing_charge_rate,
      units_used,
      unit_price,
      before_tax,
      after_tax,
    );
  } else if (req.body.kind === "gas") {
    await model.insertGasBill(
      start_date,
      end_date,
      standing_charge_days,
      standing_charge_rate,
      units_used,
      unit_price,
      before_tax,
      after_tax,
    );
  } else {
    res.send(400);
    return;
  }
  res.redirect("/energy");
};
