const utils = require("../utils");
const model = require("../models/energy.model");
const error = require("./error.controller");

exports.getRoot = async (req, res, next) => {
  const options = {};
  options.username = req.username;

  res.render("energy/index", { ...options });
};

exports.getInsertElectric = async (req, res, next) => {
  const options = {};
  options.username = req.username;
  res.render("energy/insert_electric", { ...options });
};

exports.postInsert = async (req, res, next) => {
  if (req.body.kind === "electric") await insertElectric(req.body);
  else if (req.body.kind === "gas") await insertGas(req.body);
  else {
    res.send(400);
    return;
  }
  res.redirect("/energy");
};

insertElectric = async (data) => {
  start_date = new Date(data.start_date);
  end_date = new Date(data.end_date);

  if (start_date > end_date) return;

  standing_charge_days = parseInt(data.standing_charge_days);
  standing_charge_rate = parseFloat(data.standing_charge_rate);
  standing_charge = standing_charge_days * standing_charge_rate;

  units_used = parseFloat(data.units_used);
  unit_price = parseFloat(data.unit_price);
  energy_charge = units_used * unit_price;

  before_tax = standing_charge + energy_charge;
  after_tax = before_tax * 1.05;

  log = false;
  if (log) {
    console.log("Standing order charge days:", standing_charge_days);
    console.log("Standing order charge rate:", standing_charge_rate);
    console.log("Standing order charge sum:", standing_charge);
    console.log("\nEnergy units used:", units_used);
    console.log("Energy unit price:", unit_price);
    console.log("Energy charge:", energy_charge);
    console.log("\nBefore Tax:", before_tax);
    console.log("After Tax:", after_tax);
  }

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
};

insertGas = async (data) => {
  console.log(data);
};
