const utils = require("../utils");
const model = require("../models/energy.model");
const error = require("./error.controller");
const energy = require("../utils/energy.utils");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.username;

  // await energy.updateReadings();

  res.render("energy/index", { ...options });
};

exports.getBills = async (req, res, next) => {
  const options = {};
  options.username = req.username;

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
    labels.push(entry.billing_end.toLocaleDateString());
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

exports.getInsertElectric = async (req, res, next) => {
  const options = {};
  options.username = req.username;
  res.render("energy/insert_electric", { ...options });
};

exports.getInsertGas = async (req, res, next) => {
  const options = {};
  options.username = req.username;
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
