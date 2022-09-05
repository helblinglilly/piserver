const db = require("./index");
const utils = require("../utils");
const format = require("pg-format");
const env = require("../environment");

exports.seed = async () => {
  const createUsertable = `CREATE TABLE IF NOT EXISTS usertable (
        ip varchar(255) NOT NULL PRIMARY KEY,
        username varchar(255) NOT NULL
        );`;

  const createTimesheet = `CREATE TABLE IF NOT EXISTS timesheet (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    day_date DATE NOT NULL,
    clock_in TIME NOT NULL,
    break_in TIME,
    break_out TIME,
    clock_out TIME
    );`;

  const createStopwatch = `CREATE TABLE IF NOT EXISTS stopwatch (
    id SERIAL PRIMARY KEY,
    username VARCHAR NOT NULL,
    day_date DATE NOT NULL,
    timestamp TIME NOT NULL,
    action VARCHAR(5) NOT NULL
  );`;

  const createElectricBill = `CREATE TABLE IF NOT EXISTS electricity_bill(
    id SERIAL PRIMARY KEY,
    billing_start DATE NOT NULL,
    billing_end DATE NOT NULL,
    standing_order_charge_days INTEGER NOT NULL,
    standing_order_rate DECIMAL NOT NULL,
    usage_kwh DECIMAL NOT NULL,
    rate_kwh DECIMAL NOT NULL,
    pre_tax DECIMAL NOT NULL,
    after_tax DECIMAL NOT NULL
  )`;

  const createElectricityUsage = `CREATE TABLE IF NOT EXISTS electricity_usage(
    usage_kwh DECIMAL NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_created DATE NOT NULL,
    PRIMARY KEY(usage_kwh, start_date, end_date)
  )`;

  const createGasUsage = `CREATE TABLE IF NOT EXISTS gas_usage(
    usage_kwh DECIMAL NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_created DATE NOT NULL,
    PRIMARY KEY(usage_kwh, start_date, end_date)
  )`;

  const insertElectricBills = `INSERT INTO electricity_bill
    (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax)
    VALUES
    ('2021-09-29', '2021-10-12', 13, 25.54, 44.4, 17.35, 11.02, 11.57),
    ('2021-10-12', '2021-10-13', 2, 25.54, 5.1, 17.35, 1.40, 1.47),
    ('2021-10-14', '2021-10-23', 10, 25.54, 30.1, 18.58, 8.15, 8.55),
    ('2021-10-24', '2021-11-23', 31, 25.54, 97.6, 18.58, 26.05, 27.35),
    ('2021-11-24', '2021-12-23', 30, 25.54, 111.1, 18.58, 28.30, 29.72),
    ('2021-12-24', '2022-01-23', 31, 25.54, 103.2, 18.58, 27.09, 28.45),
    ('2022-01-24', '2022-02-23', 31, 25.54, 114.6, 18.58, 29.21, 39.41),
    ('2022-02-24', '2022-03-23', 28, 25.54, 89.9, 18.58, 23.85, 25.05),
    ('2022-03-24', '2022-04-01', 9, 25.54, 28.8, 18.58, 7.65, 8.03),
    ('2022-04-02', '2022-04-23', 22, 45.96, 65.3, 26.05, 27.12, 28.48),
    ('2022-04-24', '2022-05-23', 30, 45.96, 79.5, 26.05, 24.50, 36.22),
    ('2022-05-24', '2022-06-23', 31, 45.96, 86.4, 26.05, 36.75, 38.59),
    ('2022-06-24', '2022-07-23', 30, 45.96, 87.4, 26.05, 36.56, 38.38),
    ('2022-07-24', '2022-08-23', 31, 45.96, 89.4, 26.05, 37.54, 39.41),
    ('2022-08-24', '2022-09-23', 31, 45.96, 89.4, 26.05, 37.54, 39.41)
    `;

  const createGasBill = `CREATE TABLE IF NOT EXISTS gas_bill(
    id SERIAL PRIMARY KEY,
    billing_start DATE NOT NULL,
    billing_end DATE NOT NULL,
    standing_order_charge_days INTEGER NOT NULL,
    standing_order_rate DECIMAL NOT NULL,
    usage_kwh DECIMAL NOT NULL,
    rate_kwh DECIMAL NOT NULL,
    pre_tax DECIMAL NOT NULL,
    after_tax DECIMAL NOT NULL
  )`;

  const insertGasBills = `INSERT INTO gas_bill
  (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax)
  VALUES
  ('2021-09-29', '2021-10-12', 13, 22.71, 184, 3.08, 8.61, 9.04),
  ('2021-10-12', '2021-10-13', 2, 22.71, 16.2, 3.08, 0.93, 0.98),
  ('2021-10-14', '2021-10-23', 10, 22.71, 194.9, 3.58, 9.24, 9.70),
  ('2021-10-24', '2021-12-23', 61, 22.71, 2439.7, 3.58, 101.19, 106.25),
  ('2021-12-24', '2022-01-23', 31, 22.71, 1604.2, 3.58, 64.47, 67.69),
  ('2022-01-24', '2022-02-23', 31, 22.71, 1739.8, 3.58, 69.3, 72.77),
  ('2022-02-24', '2022-03-23', 28, 22.71, 1097.7, 3.58, 45.63, 47.01),
  ('2022-03-24', '2022-04-01', 9, 22.71, 198.7, 3.58, 9.15, 9.61),
  ('2022-04-02', '2022-04-23', 22, 25.92, 349.4, 6.93, 29.91, 31.41),
  ('2022-04-24', '2022-05-23', 30, 25.92, 161.6, 6.93, 18.96, 19.91),
  ('2022-05-24', '2022-06-23', 31, 25.92, 116.5, 6.93, 16.08, 16.88),
  ('2022-06-24', '2022-07-23', 30, 25.92, 83, 6.93, 13.5, 14.18),
  ('2022-07-24', '2022-08-23', 31, 25.92, 60, 6.93, 12.18, 12.70)
  `;

  const insertTimsheet = [
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-01', '09:00:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-02', '09:00:00', '13:15:00', '14:15:00', '18:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-03', '009:00:00', '13:15:00', '14:15:00', '18:45:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-04', '09:15:00', '13:00:00', '14:00:00', '20:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-05', '09:45:00', '13:00:00', '13:45:00', '16:15:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-06', '09:00:00', '13:00:00', '14:00:00', '17:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-07', '09:00:00', null, null, '17:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2022-01-08', '09:00:00', '13:00:00', '14:00:00', null);`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-01', '09:00:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-02', '09:00:00', NULL, NULL, '18:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-03', '08:30:00', NULL, NULL, '17:00:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-04', '09:15:00', '13:00:00', '14:00:00', '17:30:00');`,
    `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', '2022-01-04', '09:45:00', '13:00:00', '14:00:00', '18:15:00');`,

    format(
      `INSERT INTO "timesheet" (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', %L, '11:30', '13:00', '14:00', null);`,
      utils.todayIso(),
    ),
    format(
      `INSERT INTO "timesheet" (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('harry', %L, '09:45', null, null, null);`,
      utils.todayIso(),
    ),
  ];

  const insertStopwatch = [
    `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES ('joel', '2022-01-01', '09:00:00', 'START');`,
    `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES ('joel', '2022-01-01', '09:30:00', 'STOP');`,
    `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES ('joel', '2022-01-01', '09:35:00', 'CONT');`,
    `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES ('joel', '2022-01-01', '13:00:00', 'STOP');`,
    `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES ('joel', '2022-01-01', '14:00:00', 'CONT');`,
    `INSERT INTO stopwatch (username, day_date, timestamp, action) VALUES ('joel', '2022-01-01', '15:00:00', 'END');`,
  ];

  if (env !== "production") {
    await db.query(`DROP TABLE IF EXISTS timesheet;`);
    await db.query(`DROP TABLE IF EXISTS stopwatch;`);
    await db.query(`DROP TABLE IF EXISTS usertable;`);
    await db.query(`DROP TABLE IF EXISTS electricity_bill`);
    await db.query(`DROP TABLE IF EXISTS gas_bill`);
    // await db.query(`DROP TABLE IF EXISTS electricity_usage`);
    // await db.query(`DROP TABLE IF EXISTS gas_usage`);
  }

  await db.query(createUsertable);
  await db.query(createStopwatch);
  await db.query(createTimesheet);
  await db.query(createElectricBill);
  await db.query(createGasBill);
  await db.query(createElectricityUsage);
  await db.query(createGasUsage);

  if (env !== "production") {
    for (query of insertTimsheet) {
      await db.query(query);
    }

    for (query of insertStopwatch) {
      await db.query(query);
    }

    await db.query(insertElectricBills);
    await db.query(insertGasBills);

    await db.query("INSERT INTO usertable (ip, username) VALUES ('127.0.0.1', 'joel');");
  }
};
