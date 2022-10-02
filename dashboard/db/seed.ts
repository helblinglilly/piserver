import log from "loglevel";
import Client from "pg";
import env from "../environment";
import format from "pg-format";
import GeneralUtils from "../utils/general.utils";
import DateUtils from "../utils/date.utils";

const logger = log.getLogger("seed");

export interface UsertableData {
  ip: string;
  username: string;
}

export interface TimesheetData {
  username: string;
  day_date: Date;
  clock_in: Date;
  break_in: Date;
  break_out: Date;
  clock_out: Date;
}

export interface StopwatchData {
  username: string;
  day_date: Date;
  timestamp: Date;
  action: "START" | "STOP" | "CONT" | "END";
}

export interface EnergyBillData {
  billing_start: Date;
  billing_end: Date;
  standing_order_charge_days: number;
  standing_order_rate: number;
  usage_kwh: number;
  rate_kwh: number;
  pre_tax: number;
  after_tax: number;
}

export interface EnergyData {
  start_date: Date;
  end_date: Date;
  usage_kwh: number;
}

export interface BinDatesData {
  bin_type: "GREEN" | "BLACK";
  collection_date: Date;
}

export class Seed {
  private client: Client.Client;
  private clearTables: boolean;
  private populateTables: boolean;
  private tomorrow: Date;

  private defaultTimesheetEntry: Array<TimesheetData> = [];

  constructor(clearTables: boolean, populateTables: boolean) {
    this.client = new Client.Client({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      database: `${process.env.POSTGRES_DATABASE}_${env}`,
    });

    this.client.connect();
    this.clearTables = clearTables;
    this.populateTables = populateTables;

    this.tomorrow = new Date();
    this.tomorrow.setDate(new Date().getDate() + 1);

    this.defaultTimesheetEntry.push({
      username: "joel",
      day_date: new Date(),
      clock_in: DateUtils.setTime(new Date(), 9, 0, 0),
      break_in: DateUtils.setTime(new Date(), 12, 0, 0),
      break_out: DateUtils.setTime(new Date(), 13, 0, 0),
      clock_out: DateUtils.setTime(new Date(), 17, 30, 0),
    });
  }

  usertable = async (
    data: Array<UsertableData> = [{ ip: "127.0.0.1", username: "joel" }],
  ) => {
    if (this.clearTables) await this.client.query(`DROP TABLE IF EXISTS usertable`);

    await this.client.query(
      `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
    );

    if (this.populateTables)
      for (const entry of data) {
        await this.client.query(
          format(
            `INSERT INTO usertable (ip, username) VALUES (%L, %L)`,
            entry.ip,
            entry.username,
          ),
        );
      }
  };

  timesheet = async (data: Array<TimesheetData> = this.defaultTimesheetEntry) => {
    if (this.clearTables) await this.client.query(`DROP TABLE IF EXISTS timesheet`);

    const createQuery = `CREATE TABLE IF NOT EXISTS timesheet (
        id SERIAL PRIMARY KEY, 
        username VARCHAR NOT NULL, 
        day_date DATE NOT NULL, 
        clock_in TIME NOT NULL, 
        break_in TIME, 
        break_out TIME, 
        clock_out TIME 
        );`;

    await this.client.query(GeneralUtils.replaceNewlineTabWithSpace(createQuery));

    const values: Array<any> = [];
    data.forEach((entry) => {
      const row = [];
      row.push(entry.username);
      row.push(entry.day_date.toISOString().split("T")[0]);
      row.push(entry.clock_in.toTimeString().split(" ")[0]);
      row.push(entry.break_in.toTimeString().split(" ")[0]);
      row.push(entry.break_out.toTimeString().split(" ")[0]);
      row.push(entry.clock_out.toTimeString().split(" ")[0]);
      values.push(row);
    });

    const insertQuery = format(
      `INSERT INTO timesheet 
      (username, day_date, clock_in, break_in, break_out, clock_out) 
      VALUES 
      %L
    `,
      values,
    );

    if (this.populateTables)
      await this.client.query(GeneralUtils.replaceNewlineTabWithSpace(insertQuery));
  };

  stopwatch = async (data: Array<StopwatchData> = []) => {
    if (this.clearTables) await this.client.query(`DROP TABLE IF EXISTS stopwatch`);

    try {
      await this.client.query(
        GeneralUtils.replaceNewlineTabWithSpace(`CREATE TABLE IF NOT EXISTS stopwatch (
        username VARCHAR NOT NULL, 
        day_date DATE NOT NULL, 
        timestamp TIME NOT NULL, 
        action VARCHAR(5) NOT NULL, 
        PRIMARY KEY(username, day_date, timestamp, action) 
      );`),
      );
    } catch (err) {
      logger.error(err);
    }

    const values: Array<any> = [];

    data.forEach((entry) => {
      const row = [];
      row.push(entry.username);
      row.push(entry.day_date.toISOString().split("T")[0]);
      row.push(entry.timestamp.toTimeString().split(" ")[0]);
      row.push(entry.action);
      values.push(row);
    });

    if (this.populateTables && values.length > 0) {
      await this.client.query(
        GeneralUtils.replaceNewlineTabWithSpace(
          format(
            `INSERT INTO stopwatch
            (username, day_date, timestamp, action)
            VALUES
            %L`,
            values,
          ),
        ),
      );
    }
  };

  binDates = async (
    data: Array<BinDatesData> = [
      { bin_type: "GREEN", collection_date: new Date() },
      { bin_type: "BLACK", collection_date: this.tomorrow },
    ],
  ) => {
    if (this.clearTables) await this.client.query(`DROP TABLE IF EXISTS bin_dates`);

    await this.client.query(
      GeneralUtils.replaceNewlineTabWithSpace(`CREATE TABLE IF NOT EXISTS bin_dates (
      bin_type varchar(12) NOT NULL, 
      collection_date DATE NOT NULL, 
      PRIMARY KEY(bin_type, collection_date) 
    )`),
    );

    const values = [];
    if (data !== null) {
      data.forEach((entry) => {
        const row = [];
        row.push(entry.bin_type);
        row.push(entry.collection_date.toISOString().split("T")[0]);
        values.push(row);
      });

      if (this.populateTables) {
        this.client.query(
          GeneralUtils.replaceNewlineTabWithSpace(
            format(
              `INSERT INTO bin_dates 
        (bin_type, collection_date) 
        VALUES 
        %L`,
              values,
            ),
          ),
        );
      }
    }
  };

  electricityBill = async (
    data: Array<EnergyBillData> = [
      {
        billing_start: new Date(),
        billing_end: this.tomorrow,
        standing_order_charge_days: 1,
        standing_order_rate: 45,
        usage_kwh: 1.5,
        rate_kwh: 45,
        pre_tax: 3.5,
        after_tax: 3.75,
      },
    ],
  ) => {
    if (this.clearTables)
      await this.client.query(`DROP TABLE IF EXISTS electricity_bill`);

    await this.client.query(
      GeneralUtils.replaceNewlineTabWithSpace(`CREATE TABLE IF NOT EXISTS electricity_bill (
      billing_start DATE NOT NULL UNIQUE, 
      billing_end DATE NOT NULL UNIQUE, 
      standing_order_charge_days INTEGER NOT NULL, 
      standing_order_rate DECIMAL NOT NULL, 
      usage_kwh DECIMAL NOT NULL, 
      rate_kwh DECIMAL NOT NULL, 
      pre_tax DECIMAL NOT NULL, 
      after_tax DECIMAL NOT NULL, 
      PRIMARY KEY(billing_start, billing_end, after_tax)
    )`),
    );

    const values = [];

    data.forEach((entry) => {
      const row = [];
      row.push(entry.billing_start.toISOString().split("T")[0]);
      row.push(entry.billing_end.toISOString().split("T")[0]);
      row.push(entry.standing_order_charge_days);
      row.push(entry.standing_order_rate);
      row.push(entry.usage_kwh);
      row.push(entry.rate_kwh);
      row.push(entry.pre_tax);
      row.push(entry.after_tax);
      values.push(row);
    });

    if (this.populateTables)
      await this.client.query(
        GeneralUtils.replaceNewlineTabWithSpace(
          format(
            `INSERT INTO electricity_bill 
        (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) 
        VALUES 
        %L`,
            values,
          ),
        ),
      );
  };

  gasBill = async (
    data: Array<EnergyBillData> = [
      {
        billing_start: new Date(),
        billing_end: this.tomorrow,
        standing_order_charge_days: 1,
        standing_order_rate: 45,
        usage_kwh: 1.5,
        rate_kwh: 45,
        pre_tax: 3.5,
        after_tax: 3.75,
      },
    ],
  ) => {
    if (this.clearTables) await this.client.query(`DROP TABLE IF EXISTS gas_bill`);

    await this.client.query(
      GeneralUtils.replaceNewlineTabWithSpace(`CREATE TABLE IF NOT EXISTS gas_bill (
      billing_start DATE NOT NULL UNIQUE, 
      billing_end DATE NOT NULL UNIQUE, 
      standing_order_charge_days INTEGER NOT NULL, 
      standing_order_rate DECIMAL NOT NULL, 
      usage_kwh DECIMAL NOT NULL, 
      rate_kwh DECIMAL NOT NULL, 
      pre_tax DECIMAL NOT NULL, 
      after_tax DECIMAL NOT NULL, 
      PRIMARY KEY(billing_start, billing_end, after_tax)
    )`),
    );

    const values = [];

    data.forEach((entry) => {
      const row = [];
      row.push(entry.billing_start.toISOString().split("T")[0]);
      row.push(entry.billing_end.toISOString().split("T")[0]);
      row.push(entry.standing_order_charge_days);
      row.push(entry.standing_order_rate);
      row.push(entry.usage_kwh);
      row.push(entry.rate_kwh);
      row.push(entry.pre_tax);
      row.push(entry.after_tax);
      values.push(row);
    });

    if (this.populateTables)
      await this.client.query(
        GeneralUtils.replaceNewlineTabWithSpace(
          format(
            `INSERT INTO gas_bill 
        (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) 
        VALUES 
        %L`,
            values,
          ),
        ),
      );
  };

  electricityUsage = async (
    data: Array<EnergyData> = [
      {
        start_date: new Date(`${new Date().toISOString().split("T")[0]}T00:00:00Z`),
        end_date: new Date(`${new Date().toISOString().split("T")[0]}T00:30:00Z`),
        usage_kwh: 0.5,
      },
      {
        start_date: new Date(`${new Date().toISOString().split("T")[0]}T00:30:00Z`),
        end_date: new Date(`${new Date().toISOString().split("T")[0]}T01:00:00Z`),
        usage_kwh: 0.5,
      },
    ],
  ) => {
    if (this.clearTables)
      await this.client.query(`DROP TABLE IF EXISTS electricity_usage`);

    await this.client.query(
      GeneralUtils.replaceNewlineTabWithSpace(`CREATE TABLE IF NOT EXISTS electricity_usage (
        usage_kwh REAL NOT NULL, 
        start_date TIMESTAMP WITH TIME ZONE NOT NULL, 
        end_date TIMESTAMP WITH TIME ZONE NOT NULL, 
        entry_created DATE NOT NULL, 
        PRIMARY KEY(usage_kwh, start_date, end_date)
      )`),
    );

    const values = [];

    data.forEach((entry) => {
      const row = [];
      row.push(entry.start_date.toISOString()),
        row.push(entry.end_date.toISOString()),
        row.push(entry.usage_kwh);
      row.push(new Date().toISOString().split("T")[0]);
      values.push(row);
    });

    if (this.populateTables)
      await this.client.query(
        GeneralUtils.replaceNewlineTabWithSpace(
          format(
            `INSERT INTO electricity_usage 
            (start_date, end_date, usage_kwh, entry_created) 
            VALUES 
            %L`,
            values,
          ),
        ),
      );
  };

  gasUsage = async (
    data: Array<EnergyData> = [
      {
        start_date: new Date(`${new Date().toISOString().split("T")[0]}T00:00:00Z`),
        end_date: new Date(`${new Date().toISOString().split("T")[0]}T00:30:00Z`),
        usage_kwh: 0.5,
      },
      {
        start_date: new Date(`${new Date().toISOString().split("T")[0]}T00:30:00Z`),
        end_date: new Date(`${new Date().toISOString().split("T")[0]}T01:00:00Z`),
        usage_kwh: 0.5,
      },
    ],
  ) => {
    if (this.clearTables) await this.client.query(`DROP TABLE IF EXISTS gas_usage`);

    await this.client.query(
      GeneralUtils.replaceNewlineTabWithSpace(`CREATE TABLE IF NOT EXISTS gas_usage (
        usage_kwh REAL NOT NULL, 
        start_date TIMESTAMP WITH TIME ZONE NOT NULL, 
        end_date TIMESTAMP WITH TIME ZONE NOT NULL, 
        entry_created DATE NOT NULL, 
        PRIMARY KEY(usage_kwh, start_date, end_date)
      )`),
    );

    const values = [];

    data.forEach((entry) => {
      const row = [];
      row.push(entry.start_date.toISOString()),
        row.push(entry.end_date.toISOString()),
        row.push(entry.usage_kwh);
      row.push(new Date().toISOString().split("T")[0]);
      values.push(row);
    });

    if (this.populateTables)
      await this.client.query(
        GeneralUtils.replaceNewlineTabWithSpace(
          format(
            `INSERT INTO gas_usage 
            (start_date, end_date, usage_kwh, entry_created) 
            VALUES 
            %L`,
            values,
          ),
        ),
      );
  };

  static seedForProduction = async () => {
    logger.info("Seeding for production");
    const seed = new Seed(false, false);
    await seed.usertable(null);
    await seed.timesheet(null);
    await seed.stopwatch();
    await seed.binDates(null);
    await seed.gasBill(null);
    await seed.electricityBill(null);
    await seed.gasUsage(null);
    await seed.electricityUsage(null);
    logger.info("Copmleted seeding");
  };

  static seedForDev = async () => {
    logger.info("Seeding for develop");
    const seed = new Seed(true, true);
    await seed.usertable();
    await seed.timesheet();
    await seed.stopwatch();
    await seed.binDates();
    await seed.gasBill();
    await seed.electricityBill();
    await seed.gasUsage();
    await seed.electricityUsage();
    logger.info("Completed seeding");
  };
}

export default Seed;
/*




  const createElectricityUsage = `CREATE TABLE IF NOT EXISTS electricity_usage(
    usage_kwh REAL NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_created DATE NOT NULL,
    PRIMARY KEY(usage_kwh, start_date, end_date)
  )`;

  const createGasUsage = `CREATE TABLE IF NOT EXISTS gas_usage(
    usage_kwh REAL NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_created DATE NOT NULL,
    PRIMARY KEY(usage_kwh, start_date, end_date)
  )`;

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

  const insertGasEntry = format(
    `INSERT INTO gas_usage
  (start_date, end_date, usage_kwh, entry_created)
  VALUES
  (%L, %L, 1, %L),
  (%L, %L, 1, %L)`,
    today,
    new Date(today.getMinutes() + 30),
    today,
    new Date(today.getMinutes() + 30),
    new Date(today.getHours() + 1),
    today,
  );

  const insertElectricityEntry = format(
    `INSERT INTO electricity_usage
  (start_date, end_date, usage_kwh, entry_created)
  VALUES
  (%L, %L, 1, %L),
  (%L, %L, 1, %L)`,
    today,
    new Date(today.getMinutes() + 30),
    today,
    new Date(today.getMinutes() + 30),
    new Date(today.getHours() + 1),
    today,
  );

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


  

  if (env !== "production") {
    await query(`DROP TABLE IF EXISTS electricity_bill`);
    await query(`DROP TABLE IF EXISTS gas_bill`);
    await query(`DROP TABLE IF EXISTS electricity_usage`);
    await query(`DROP TABLE IF EXISTS gas_usage`);
  }

  await query(createBinDates);
  await query(createElectricBill);
  await query(createGasBill);
  await query(createElectricityUsage);
  await query(createGasUsage);

  if (env !== "production") {
    await query(insertBinDates);
    await query(insertElectricBills);
    await query(insertGasBills);
    await query(insertGasEntry);
    await query(insertElectricityEntry);
  }
}
*/
