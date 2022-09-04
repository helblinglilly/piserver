const db = require("../db");
const format = require("pg-format");

exports.insertElectricityBill = async (
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
      `INSERT INTO electricity_bill 
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

exports.insertGasBill = async (
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
      `INSERT INTO gas_bill 
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

exports.selectEnergyBill = async () => {
  return db
    .query(
      format(
        `SELECT billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax 
        FROM electricity_bill
        ORDER BY billing_start`,
      ),
    )
    .then((result) => {
      return result.rows;
    });
};

exports.selectGasBill = async () => {
  return db
    .query(
      format(
        `SELECT billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax 
        FROM gas_bill
        ORDER BY billing_start`,
      ),
    )
    .then((result) => {
      return result.rows;
    });
};

exports.insertElectricityEntry = async (startDate, endDate, usage) => {
  return db.query(
    format(
      `INSERT INTO electricity_usage
      (start_date, end_date, usage_kwh, entry_created)
      VALUES
      (%L, %L, %L, %L)`,
      startDate,
      endDate,
      usage,
      new Date(),
    ),
  );
};

exports.insertGasEntry = async (startDate, endDate, usage) => {
  return db.query(
    format(
      `INSERT INTO gas_usage
      (start_date, end_date, usage_kwh, entry_created)
      VALUES
      (%L, %L, %L, %L)`,
      startDate,
      endDate,
      usage,
      new Date(),
    ),
  );
};

exports.selectLatestElectricityEntry = async () => {
  return db
    .query(format(`SELECT MAX(entry_created) FROM electricity_usage`))
    .then((result) => {
      if (result.rows[0].max == null) {
        return new Date(process.env.MOVE_IN_DATE);
      }
      return new Date(result.rows[0].max);
    });
};

exports.selectLatestGasEntry = async () => {
  return db.query(format(`SELECT MAX(entry_created) FROM gas_usage`)).then((result) => {
    if (result.rows[0].max == null) {
      return new Date(process.env.MOVE_IN_DATE);
    }
    return new Date(result.rows[0].max);
  });
};
