const utils = require("../utils");
const model = require("../models/energy.model");
const error = require("./error.controller");
const energy = require("../utils/energy.utils");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.username;

  await energy.updateReadings();

  let startDate;
  let endDate;
  if (req.query.date) {
    startDate = new Date(req.query.date);
    startDate.setDate(startDate.getDate());
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(startDate.toISOString());
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
  }

  const electricity_entries = await model.selectElectricityEntry(startDate, endDate);
  const gas_entries = await model.selectGasEntry(startDate, endDate);

  const electricityDataPoint = [];
  const electricityLabels = [];

  const gasDataPoint = [];
  const gasLabels = [];

  electricity_entries.forEach((entry) => {
    const usage = parseFloat(entry.usage_kwh);

    if (electricityDataPoint.length === 0) {
      electricityDataPoint.push(parseFloat(usage.toFixed(5)));
      aggregate = true;
    } else {
      electricityDataPoint.push(
        parseFloat(
          (electricityDataPoint[electricityDataPoint.length - 1] + usage).toFixed(5),
        ),
      );
    }

    const start_range_time = entry.start_date.toUTCString().split(" ")[4].split(":");
    const end_range_time = entry.end_date.toUTCString().split(" ")[4].split(":");

    const label = `${start_range_time[0]}:${start_range_time[1]}-${end_range_time[0]}:${end_range_time[1]}`;
    electricityLabels.push(label);
  });

  gas_entries.forEach((entry) => {
    const usage = parseFloat(entry.usage_kwh);

    if (gasDataPoint.length === 0) {
      gasDataPoint.push(parseFloat(usage.toFixed(5)));
      aggregate = true;
    } else {
      gasDataPoint.push(
        parseFloat((gasDataPoint[gasDataPoint.length - 1] + usage).toFixed(5)),
      );
    }

    const start_range_time = entry.start_date.toUTCString().split(" ")[4].split(":");
    const end_range_time = entry.end_date.toUTCString().split(" ")[4].split(":");

    const label = `${start_range_time[0]}:${start_range_time[1]}-${end_range_time[0]}:${end_range_time[1]}`;
    gasLabels.push(label);
  });

  options.energy_chart_data = JSON.stringify({
    data: {
      labels: electricityLabels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: electricityDataPoint,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            display: true,
          },
        ],
      },
      title: {
        display: true,
        text: `${startDate.toLocaleDateString("en-GB")} kWh`,
      },
    },
  });

  options.gas_chart_data = JSON.stringify({
    data: {
      labels: gasLabels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: gasDataPoint,
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        yAxes: [
          {
            display: true,
          },
        ],
      },
      title: {
        display: true,
        text: `${startDate.toLocaleDateString("en-GB")} kWh`,
      },
    },
  });

  options.energy_used = `${electricityDataPoint[electricityDataPoint.length - 1]} kWh`;
  const electricityMeta = await model.selectLatestElectricityRateAndCharge();

  options.gas_used = `${gasDataPoint[gasDataPoint.length - 1]} kWh`;
  const gasMeta = await model.selectLatestElectricityRateAndCharge();

  let electricityCharge =
    electricityDataPoint[electricityDataPoint.length - 1] *
    parseFloat(electricityMeta.rate_kwh);
  electricityCharge += parseFloat(electricityMeta.standing_order_rate);

  let gasCharge = gasDataPoint[gasDataPoint.length - 1] * parseFloat(gasMeta.rate_kwh);
  gasCharge += parseFloat(gasMeta.standing_order_rate);

  options.energy_charged = "£" + electricityCharge / 100;
  options.gas_charged = "£" + parseFloat((gasCharge / 100).toFixed(5));

  options.date = endDate.toISOString().split("T")[0];

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
