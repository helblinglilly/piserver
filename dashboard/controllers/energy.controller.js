const utils = require("../utils");
const model = require("../models/energy.model");
const error = require("./error.controller");
const energy = require("../utils/energy.utils");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.username;

  await energy.updateReadings();

  const energy_data = await model.selectEnergyBill();
  const energyData = [];
  const energyLabels = [];
  let highestEnergyUsage = 0;

  energy_data.forEach((entry) => {
    energyData.push(entry.usage_kwh);
    energyLabels.push(entry.billing_end.toLocaleDateString());

    if (entry.usage_kwh > highestEnergyUsage) highestEnergyUsage = entry.usage_kwh;
  });

  options.electricity_usage_data = JSON.stringify({
    data: {
      labels: energyLabels,
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: energyData,
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
              suggestedMax: highestEnergyUsage + 10,
            },
          },
        ],
      },
    },
  });

  options.gas_usage_data = JSON.stringify({
    data: {
      datasets: [
        {
          pointRadius: 4,
          pointBackgroundColor: "rgb(0,0,255)",
          data: [
            { x: 50, y: 7 },
            { x: 60, y: 8 },
            { x: 70, y: 8 },
            { x: 80, y: 9 },
            { x: 90, y: 9 },
            { x: 100, y: 9 },
            { x: 110, y: 10 },
            { x: 120, y: 11 },
            { x: 130, y: 14 },
            { x: 140, y: 14 },
            { x: 150, y: 15 },
          ],
        },
      ],
    },
    options: {
      legend: { display: false },
      scales: {
        xAxes: [{ ticks: { min: 40, max: 160 } }],
        yAxes: [{ ticks: { min: 6, max: 16 } }],
      },
    },
  });

  res.render("energy/index", { ...options });
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
