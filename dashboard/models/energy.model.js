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

exports.selectElectricityEntry = async (startDate, endDate) => {
  // select * from electricity_usage where start_date >= '2021-10-01'::date and end_date < '2021-10-05'::date ORDER BY start_date ASC;
  return db
    .query(
      format(
        `SELECT usage_kwh, start_date, end_date 
      FROM electricity_usage 
      WHERE start_date >= %L::date 
      AND end_date <= %L::date 
      ORDER BY start_date ASC`,
        startDate.toISOString(),
        endDate.toISOString(),
      ),
    )
    .then((result) => {
      return result.rows;
    });
};

exports.selectGasEntry = async (startDate, endDate) => {
  // select * from electricity_usage where start_date >= '2021-10-01'::date and end_date < '2021-10-05'::date ORDER BY start_date ASC;
  return db
    .query(
      format(
        `SELECT usage_kwh, start_date, end_date 
      FROM gas_usage 
      WHERE start_date >= %L::date 
      AND end_date <= %L::date 
      ORDER BY start_date ASC`,
        startDate.toISOString(),
        endDate.toISOString(),
      ),
    )
    .then((result) => {
      return result.rows;
    });
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

exports.selectLatestElectricityRateAndCharge = async () => {
  return db
    .query(
      format(`SELECT standing_order_rate, rate_kwh
  FROM electricity_bill
  ORDER BY billing_end DESC
  LIMIT 1
  `),
    )
    .then((result) => {
      return result.rows[0];
    });
};
