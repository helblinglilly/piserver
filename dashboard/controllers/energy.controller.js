const utils = require("../utils");
const model = require("../models/energy.model");
const error = require("./error.controller");
const energy = require("../utils/energy.utils");

exports.getRoot = async (req, res, next) => {
  const fromDate = new Date();
  fromDate.setUTCDate(fromDate.getUTCDate() - 5);
  fromDate.setHours(0);
  fromDate.setMinutes(0);
  fromDate.setSeconds(0);
  fromDate.setMilliseconds(0);
  await energy.updateReadingsForDay(fromDate.toISOString());

  const options = {};
  options.username = req.username;

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
    await model.insertEnergyEntry(
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
    await model.insertGasEntry(
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
