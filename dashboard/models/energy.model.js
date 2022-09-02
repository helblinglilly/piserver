const db = require("../db");
const format = require("pg-format");

exports.insertEnergyEntry = async (
  start_date,
  end_date,
  standing_days,
  standing_rate,
  usage,
  rate,
  pre_tax,
  after_tax,
) => {
  return db.query(
    format(
      `INSERT INTO energy 
      (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax)
      VALUES
      (%L, %L, %L, %L, %L, %L, %L, %L)`,
      start_date,
      end_date,
      standing_days,
      standing_rate,
      usage,
      rate,
      pre_tax,
      after_tax,
    ),
  );
};

exports.selectEnergyEntry = async () => {
  return db
    .query(
      format(
        `SELECT billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax ORDER BY billing_start`,
      ),
    )
    .then((result) => {
      console.log(result);
      return result.rows;
    });
};

exports.insertGasEntry = async (
  start_date,
  end_date,
  standing_days,
  standing_rate,
  usage,
  rate,
  pre_tax,
  after_tax,
) => {
  return db.query(
    format(
      `INSERT INTO gas 
        (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax)
        VALUES
        (%L, %L, %L, %L, %L, %L, %L, %L)`,
      start_date,
      end_date,
      standing_days,
      standing_rate,
      usage,
      rate,
      pre_tax,
      after_tax,
    ),
  );
};
