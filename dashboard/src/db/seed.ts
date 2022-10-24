import log from "loglevel";
import "../utils/log.utils";
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
    if (data != null) {
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
    }

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

    if (data !== null) {
      data.forEach((entry) => {
        const row = [];
        row.push(entry.username);
        row.push(entry.day_date.toISOString().split("T")[0]);
        row.push(entry.timestamp.toTimeString().split(" ")[0]);
        row.push(entry.action);
        values.push(row);
      });
    }

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

    if (data != null) {
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
    }

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

    if (data != null) {
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
    }

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

    if (data != null) {
      data.forEach((entry) => {
        const row = [];
        row.push(entry.start_date.toISOString()),
          row.push(entry.end_date.toISOString()),
          row.push(entry.usage_kwh);
        row.push(new Date().toISOString().split("T")[0]);
        values.push(row);
      });
    }

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

    if (data != null) {
      data.forEach((entry) => {
        const row = [];
        row.push(entry.start_date.toISOString()),
          row.push(entry.end_date.toISOString()),
          row.push(entry.usage_kwh);
        row.push(new Date().toISOString().split("T")[0]);
        values.push(row);
      });
    }

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
    logger.info("Completed seeding");
  };

  static seedForDev = async () => {
    logger.info("Seeding for develop");
    const seed = new Seed(true, true);
    await seed.usertable();
    await seed.timesheet();
    await seed.stopwatch(null);
    await seed.binDates();
    await seed.gasBill();
    await seed.electricityBill();
    await seed.gasUsage();
    await seed.electricityUsage();
    logger.info("Completed seeding");
  };
}

export default Seed;
