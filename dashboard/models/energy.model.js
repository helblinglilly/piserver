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
  console.log("Insert");
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
  const createdDate = new Date();
  try {
    await db.query(
      format(
        `INSERT INTO electricity_usage
        (start_date, end_date, usage_kwh, entry_created)
        VALUES
        (%L, %L, %L, %L)`,
        startDate,
        endDate,
        usage,
        createdDate,
      ),
    );
  } catch (exception) {
    console.log(exception);
    await db.query(
      format(
        `DELETE FROM electricity_usage 
        WHERE (start_date=%L, end_date=%L, usage_kwh=%L, entry_created=%L)`,
        startDate,
        endDate,
        usage,
        createdDate,
      ),
    );
    await this.insertElectricityEntry(startDate, endDate, usage);
  }
};

exports.selectElectricityEntry = async (startDate, endDate) => {
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
  const createdDate = new Date();
  try {
    await db.query(
      format(
        `INSERT INTO gas_usage
        (start_date, end_date, usage_kwh, entry_created)
        VALUES
        (%L, %L, %L, %L)`,
        startDate,
        endDate,
        usage,
        createdDate,
      ),
    );
  } catch (exception) {
    console.log(exception);
    await db.query(
      format(
        `DELETE FROM gas_usage 
        WHERE (start_date=%L, end_date=%L, usage_kwh=%L, entry_created=%L)`,
        startDate,
        endDate,
        usage,
        createdDate,
      ),
    );
    await this.insertGasEntry(startDate, endDate, usage);
  }
};

exports.selectLatestElectricityEntryInsert = async () => {
  return db
    .query(format(`SELECT MAX(entry_created) FROM electricity_usage`))
    .then((result) => {
      if (result.rows[0].max == null) {
        return new Date(process.env.MOVE_IN_DATE);
      }
      return new Date(result.rows[0].max);
    });
};

exports.selectLatestGasEntryInsert = async () => {
  return db.query(format(`SELECT MAX(entry_created) FROM gas_usage`)).then((result) => {
    if (result.rows[0].max == null) {
      return new Date(process.env.MOVE_IN_DATE);
    }
    return new Date(result.rows[0].max);
  });
};

exports.selectLatestGasEntry = async () => {
  return db.query(format(`SELECT MAX(start_date) FROM gas_usage`)).then((result) => {
    if (result.rows[0].max == null) {
      return new Date(process.env.MOVE_IN_DATE);
    }
    return new Date(result.rows[0].max);
  });
};

exports.selectLatestElectricityEntry = async () => {
  return db
    .query(format(`SELECT MAX(start_date) FROM electricity_usage`))
    .then((result) => {
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
      if (result.rows.length === 0) {
        return {
          standing_order_rate: 45.96,
          rate_kwh: 26.05,
        };
      }
      return result.rows[0];
    });
};

exports.selectHighestGasUsage = async () => {
  return db.query(format(`SELECT `));
};

exports.selectLatestGasRateAndCharge = async () => {
  return db
    .query(
      format(`SELECT standing_order_rate, rate_kwh
  FROM gas_bill
  ORDER BY billing_end DESC
  LIMIT 1
  `),
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return {
          standing_order_rate: 45.96,
          rate_kwh: 26.05,
        };
      }
      return result.rows[0];
    });
};

exports.selectStartEndBillDatesFromDate = async (providedDate) => {
  return db
    .query(
      format(
        `SELECT billing_start, billing_end 
    FROM electricity_bill
    WHERE billing_start <= %L::date
    AND billing_end >= %L::date
    ORDER BY billing_start
    `,
        providedDate.toISOString(),
        providedDate.toISOString(),
      ),
    )
    .then((result) => {
      const start =
        result.rows[0] != undefined ? result.rows[0].billing_start : new Date();
      const end = result.rows[0] != undefined ? result.rows[0].billing_end : new Date();
      return {
        billing_start: start,
        billing_end: end,
      };
    });
};

exports.selectLatestElectricityBillDate = async () => {
  return db
    .query(format(`SELECT MAX(billing_end) FROM electricity_bill`))
    .then((result) => {
      if (result.rows[0].max == null) {
        return new Date(process.env.MOVE_IN_DATE);
      }
      return new Date(result.rows[0].max);
    });
};
