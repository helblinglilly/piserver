import log from "loglevel";
import Seed, { EnergyBillData, EnergyData, TimesheetData } from "../../../db/seed";
import Client from "pg";
import format from "pg-format";
import DateUtils from "../../../utils/date.utils";

log.disableAll();

jest.mock("pg", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe("Would drop database when appropriate", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("usertable", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.usertable();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS usertable");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.usertable();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS usertable");
    });
  });

  describe("timesheet", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.timesheet();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS timesheet");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.timesheet();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS timesheet");
    });
  });

  describe("stopwatch", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.stopwatch();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS stopwatch");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.stopwatch();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS stopwatch");
    });
  });

  describe("bin_dates", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.binDates();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS bin_dates");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.binDates();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS bin_dates");
    });
  });

  describe("electricity_bill", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.electricityBill();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS electricity_bill");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.electricityBill();
      expect(client.query).not.toHaveBeenCalledWith(
        "DROP TABLE IF EXISTS electricity_bill",
      );
    });
  });

  describe("gas_bill", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.gasBill();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS gas_bill");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.gasBill();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS gas_bill");
    });
  });

  describe("electricity_usage", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.electricityUsage();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS electricity_usage");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.electricityUsage();
      expect(client.query).not.toHaveBeenCalledWith(
        "DROP TABLE IF EXISTS electricity_usage",
      );
    });
  });

  describe("gas_usage", () => {
    test("Drop database", async () => {
      const seed = new Seed(true, false);
      await seed.gasUsage();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS gas_usage");
    });
    test("Don't drop database", async () => {
      const seed = new Seed(false, false);
      await seed.gasUsage();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS gas_usage");
    });
  });
});

describe("usertable", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.usertable();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.usertable();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS usertable`],
      [
        `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
      ],
    ]);
  });

  test("Create and populate with defaults", async () => {
    const seed = new Seed(false, true);
    await seed.usertable();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
      ],
      [`INSERT INTO usertable (ip, username) VALUES ('127.0.0.1', 'joel')`],
    ]);
  });

  test("Drop, create and populate with defaults", async () => {
    const seed = new Seed(true, true);
    await seed.usertable();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS usertable`],
      [
        `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
      ],
      [`INSERT INTO usertable (ip, username) VALUES ('127.0.0.1', 'joel')`],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);
    await seed.usertable([{ ip: "127.0.0.2", username: "user1" }]);
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS usertable`],
      [
        `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
      ],
      [`INSERT INTO usertable (ip, username) VALUES ('127.0.0.2', 'user1')`],
    ]);
  });
});

describe("timesheet", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.timesheet();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS timesheet (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, day_date DATE NOT NULL, clock_in TIME NOT NULL, break_in TIME, break_out TIME, clock_out TIME );`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.timesheet();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS timesheet`],
      [
        `CREATE TABLE IF NOT EXISTS timesheet (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, day_date DATE NOT NULL, clock_in TIME NOT NULL, break_in TIME, break_out TIME, clock_out TIME );`,
      ],
    ]);
  });

  test("Create and populate with defaults", async () => {
    const seed = new Seed(false, true);
    await seed.timesheet();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS timesheet (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, day_date DATE NOT NULL, clock_in TIME NOT NULL, break_in TIME, break_out TIME, clock_out TIME );`,
      ],
      [
        `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '${
          new Date().toISOString().split("T")[0]
        }', '09:00:00', '12:00:00', '13:00:00', '17:30:00')`,
      ],
    ]);
  });

  test("Drop, create and populate with defaults", async () => {
    const seed = new Seed(true, true);
    await seed.timesheet();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS timesheet`],
      [
        `CREATE TABLE IF NOT EXISTS timesheet (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, day_date DATE NOT NULL, clock_in TIME NOT NULL, break_in TIME, break_out TIME, clock_out TIME );`,
      ],
      [
        `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '${
          new Date().toISOString().split("T")[0]
        }', '09:00:00', '12:00:00', '13:00:00', '17:30:00')`,
      ],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);
    await seed.timesheet([
      {
        username: "joel",
        day_date: new Date("2020-02-02"),
        clock_in: DateUtils.setTime(new Date(), 7, 0, 0),
        break_in: DateUtils.setTime(new Date(), 11, 0, 0),
        break_out: DateUtils.setTime(new Date(), 12, 0, 0),
        clock_out: DateUtils.setTime(new Date(), 18, 30, 0),
      },
    ]);
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS timesheet`],
      [
        `CREATE TABLE IF NOT EXISTS timesheet (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, day_date DATE NOT NULL, clock_in TIME NOT NULL, break_in TIME, break_out TIME, clock_out TIME );`,
      ],
      [
        `INSERT INTO timesheet (username, day_date, clock_in, break_in, break_out, clock_out) VALUES ('joel', '2020-02-02', '07:00:00', '11:00:00', '12:00:00', '18:30:00')`,
      ],
    ]);
  });
});

describe("stopwatch", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.stopwatch();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS stopwatch (username VARCHAR NOT NULL, day_date DATE NOT NULL, timestamp TIME NOT NULL, action VARCHAR(5) NOT NULL, PRIMARY KEY(username, day_date, timestamp, action) );`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.stopwatch();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS stopwatch`],
      [
        `CREATE TABLE IF NOT EXISTS stopwatch (username VARCHAR NOT NULL, day_date DATE NOT NULL, timestamp TIME NOT NULL, action VARCHAR(5) NOT NULL, PRIMARY KEY(username, day_date, timestamp, action) );`,
      ],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);
    const now = new Date();
    await seed.stopwatch([
      {
        username: "joel",
        day_date: now,
        timestamp: now,
        action: "START",
      },
    ]);
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS stopwatch`],
      [
        `CREATE TABLE IF NOT EXISTS stopwatch (username VARCHAR NOT NULL, day_date DATE NOT NULL, timestamp TIME NOT NULL, action VARCHAR(5) NOT NULL, PRIMARY KEY(username, day_date, timestamp, action) );`,
      ],
      [
        `INSERT INTO stopwatch(username, day_date, timestamp, action)VALUES('joel', '${
          now.toISOString().split("T")[0]
        }', '${now.toTimeString().split(" ")[0]}', 'START')`,
      ],
    ]);
  });
});

describe("bin_dates", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.binDates();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS bin_dates (bin_type varchar(12) NOT NULL, collection_date DATE NOT NULL, PRIMARY KEY(bin_type, collection_date) )`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.binDates();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS bin_dates`],
      [
        `CREATE TABLE IF NOT EXISTS bin_dates (bin_type varchar(12) NOT NULL, collection_date DATE NOT NULL, PRIMARY KEY(bin_type, collection_date) )`,
      ],
    ]);
  });

  test("Create and populate with defaults", async () => {
    const seed = new Seed(false, true);
    await seed.binDates();

    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS bin_dates (bin_type varchar(12) NOT NULL, collection_date DATE NOT NULL, PRIMARY KEY(bin_type, collection_date) )`,
      ],
      [
        `INSERT INTO bin_dates (bin_type, collection_date) VALUES ('GREEN', '${
          new Date().toISOString().split("T")[0]
        }'), ('BLACK', '${yesterday.toISOString().split("T")[0]}')`,
      ],
    ]);
  });

  test("Drop, create and populate with defaults", async () => {
    const seed = new Seed(true, true);
    await seed.binDates();

    const yesterday = new Date();
    yesterday.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS bin_dates`],
      [
        `CREATE TABLE IF NOT EXISTS bin_dates (bin_type varchar(12) NOT NULL, collection_date DATE NOT NULL, PRIMARY KEY(bin_type, collection_date) )`,
      ],
      [
        `INSERT INTO bin_dates (bin_type, collection_date) VALUES ('GREEN', '${
          new Date().toISOString().split("T")[0]
        }'), ('BLACK', '${yesterday.toISOString().split("T")[0]}')`,
      ],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);
    await seed.binDates([{ bin_type: "GREEN", collection_date: new Date() }]);
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS bin_dates`],
      [
        `CREATE TABLE IF NOT EXISTS bin_dates (bin_type varchar(12) NOT NULL, collection_date DATE NOT NULL, PRIMARY KEY(bin_type, collection_date) )`,
      ],
      [
        `INSERT INTO bin_dates (bin_type, collection_date) VALUES ('GREEN', '${
          new Date().toISOString().split("T")[0]
        }')`,
      ],
    ]);
  });
});

describe("electricity_bill", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.electricityBill();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS electricity_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.binDates();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS bin_dates`],
      [
        `CREATE TABLE IF NOT EXISTS bin_dates (bin_type varchar(12) NOT NULL, collection_date DATE NOT NULL, PRIMARY KEY(bin_type, collection_date) )`,
      ],
    ]);
  });

  test("Create and populate with defaults", async () => {
    const seed = new Seed(false, true);
    await seed.electricityBill();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS electricity_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
      [
        `INSERT INTO electricity_bill (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) VALUES ('${
          new Date().toISOString().split("T")[0]
        }', '${
          tomorrow.toISOString().split("T")[0]
        }', '1', '45', '1.5', '45', '3.5', '3.75')`,
      ],
    ]);
  });

  test("Drop, create and populate with defaults", async () => {
    const seed = new Seed(true, true);
    await seed.electricityBill();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS electricity_bill`],
      [
        `CREATE TABLE IF NOT EXISTS electricity_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
      [
        `INSERT INTO electricity_bill (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) VALUES ('${
          new Date().toISOString().split("T")[0]
        }', '${
          tomorrow.toISOString().split("T")[0]
        }', '1', '45', '1.5', '45', '3.5', '3.75')`,
      ],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);
    const input = [
      {
        billing_start: new Date("2018-01-01"),
        billing_end: new Date("2018-01-02"),
        standing_order_charge_days: 31,
        standing_order_rate: 45,
        usage_kwh: 45.6,
        rate_kwh: 45,
        pre_tax: 45.5,
        after_tax: 50.6,
      },
    ];
    await seed.electricityBill(input);

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS electricity_bill`],
      [
        `CREATE TABLE IF NOT EXISTS electricity_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
      [
        `INSERT INTO electricity_bill (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) VALUES ('2018-01-01', '2018-01-02', '31', '45', '45.6', '45', '45.5', '50.6')`,
      ],
    ]);
  });
});

describe("gas_bill", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.gasBill();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS gas_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.gasBill();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS gas_bill`],
      [
        `CREATE TABLE IF NOT EXISTS gas_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
    ]);
  });

  test("Create and populate with defaults", async () => {
    const seed = new Seed(false, true);
    await seed.gasBill();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS gas_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
      [
        `INSERT INTO gas_bill (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) VALUES ('${
          new Date().toISOString().split("T")[0]
        }', '${
          tomorrow.toISOString().split("T")[0]
        }', '1', '45', '1.5', '45', '3.5', '3.75')`,
      ],
    ]);
  });

  test("Drop, create and populate with defaults", async () => {
    const seed = new Seed(true, true);
    await seed.gasBill();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS gas_bill`],
      [
        `CREATE TABLE IF NOT EXISTS gas_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
      [
        `INSERT INTO gas_bill (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) VALUES ('${
          new Date().toISOString().split("T")[0]
        }', '${
          tomorrow.toISOString().split("T")[0]
        }', '1', '45', '1.5', '45', '3.5', '3.75')`,
      ],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);
    const input = [
      {
        billing_start: new Date("2018-01-01"),
        billing_end: new Date("2018-01-02"),
        standing_order_charge_days: 31,
        standing_order_rate: 45,
        usage_kwh: 45.6,
        rate_kwh: 45,
        pre_tax: 45.5,
        after_tax: 50.6,
      },
    ];
    await seed.gasBill(input);

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS gas_bill`],
      [
        `CREATE TABLE IF NOT EXISTS gas_bill (billing_start DATE NOT NULL UNIQUE, billing_end DATE NOT NULL UNIQUE, standing_order_charge_days INTEGER NOT NULL, standing_order_rate DECIMAL NOT NULL, usage_kwh DECIMAL NOT NULL, rate_kwh DECIMAL NOT NULL, pre_tax DECIMAL NOT NULL, after_tax DECIMAL NOT NULL, PRIMARY KEY(billing_start, billing_end, after_tax))`,
      ],
      [
        `INSERT INTO gas_bill (billing_start, billing_end, standing_order_charge_days, standing_order_rate, usage_kwh, rate_kwh, pre_tax, after_tax) VALUES ('2018-01-01', '2018-01-02', '31', '45', '45.6', '45', '45.5', '50.6')`,
      ],
    ]);
  });
});

describe("electricity_usage", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.electricityUsage();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS electricity_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.electricityUsage();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS electricity_usage`],
      [
        `CREATE TABLE IF NOT EXISTS electricity_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
    ]);
  });

  test("Create and populate with defaults", async () => {
    const seed = new Seed(false, true);
    await seed.electricityUsage();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS electricity_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
      [
        `INSERT INTO electricity_usage (start_date, end_date, usage_kwh, entry_created) VALUES ('${
          new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
        }', '${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '0.5', '${
          new Date().toISOString().split("T")[0]
        }'), ('${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '${
          new Date().toISOString().split("T")[0] + "T01:00:00.000Z"
        }', '0.5', '${new Date().toISOString().split("T")[0]}')`,
      ],
    ]);
  });

  test("Drop, create and populate with defaults", async () => {
    const seed = new Seed(true, true);
    await seed.electricityUsage();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS electricity_usage`],
      [
        `CREATE TABLE IF NOT EXISTS electricity_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
      [
        `INSERT INTO electricity_usage (start_date, end_date, usage_kwh, entry_created) VALUES ('${
          new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
        }', '${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '0.5', '${
          new Date().toISOString().split("T")[0]
        }'), ('${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '${
          new Date().toISOString().split("T")[0] + "T01:00:00.000Z"
        }', '0.5', '${new Date().toISOString().split("T")[0]}')`,
      ],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);

    const input = [
      {
        start_date: new Date("2020-01-01T06:30:00Z"),
        end_date: new Date("2020-01-01T07:00:00Z"),
        usage_kwh: 1.5,
      },
    ];

    await seed.electricityUsage(input);

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS electricity_usage`],
      [
        `CREATE TABLE IF NOT EXISTS electricity_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
      [
        `INSERT INTO electricity_usage (start_date, end_date, usage_kwh, entry_created) VALUES ('${input[0].start_date.toISOString()}', '${input[0].end_date.toISOString()}', '1.5', '${
          new Date().toISOString().split("T")[0]
        }')`,
      ],
    ]);
  });
});

describe("gas_usage", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Create only", async () => {
    const seed = new Seed(false, false);
    await seed.gasUsage();
    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS gas_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
    ]);
  });

  test("Drop and create", async () => {
    const seed = new Seed(true, false);
    await seed.gasUsage();
    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS gas_usage`],
      [
        `CREATE TABLE IF NOT EXISTS gas_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
    ]);
  });

  test("Create and populate with defaults", async () => {
    const seed = new Seed(false, true);
    await seed.gasUsage();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [
        `CREATE TABLE IF NOT EXISTS gas_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
      [
        `INSERT INTO gas_usage (start_date, end_date, usage_kwh, entry_created) VALUES ('${
          new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
        }', '${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '0.5', '${
          new Date().toISOString().split("T")[0]
        }'), ('${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '${
          new Date().toISOString().split("T")[0] + "T01:00:00.000Z"
        }', '0.5', '${new Date().toISOString().split("T")[0]}')`,
      ],
    ]);
  });

  test("Drop, create and populate with defaults", async () => {
    const seed = new Seed(true, true);
    await seed.gasUsage();

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS gas_usage`],
      [
        `CREATE TABLE IF NOT EXISTS gas_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
      [
        `INSERT INTO gas_usage (start_date, end_date, usage_kwh, entry_created) VALUES ('${
          new Date().toISOString().split("T")[0] + "T00:00:00.000Z"
        }', '${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '0.5', '${
          new Date().toISOString().split("T")[0]
        }'), ('${new Date().toISOString().split("T")[0] + "T00:30:00.000Z"}', '${
          new Date().toISOString().split("T")[0] + "T01:00:00.000Z"
        }', '0.5', '${new Date().toISOString().split("T")[0]}')`,
      ],
    ]);
  });

  test("Drop, create and populate with custom entry", async () => {
    const seed = new Seed(true, true);

    const input = [
      {
        start_date: new Date("2020-01-01T06:30:00Z"),
        end_date: new Date("2020-01-01T07:00:00Z"),
        usage_kwh: 1.5,
      },
    ];

    await seed.gasUsage(input);

    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);

    expect(client.query.mock.calls).toEqual([
      [`DROP TABLE IF EXISTS gas_usage`],
      [
        `CREATE TABLE IF NOT EXISTS gas_usage (usage_kwh REAL NOT NULL, start_date TIMESTAMP WITH TIME ZONE NOT NULL, end_date TIMESTAMP WITH TIME ZONE NOT NULL, entry_created DATE NOT NULL, PRIMARY KEY(usage_kwh, start_date, end_date))`,
      ],
      [
        `INSERT INTO gas_usage (start_date, end_date, usage_kwh, entry_created) VALUES ('${input[0].start_date.toISOString()}', '${input[0].end_date.toISOString()}', '1.5', '${
          new Date().toISOString().split("T")[0]
        }')`,
      ],
    ]);
  });
});

describe("general", () => {
  let client;
  beforeEach(() => {
    client = new Client.Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Connects to the database", () => {
    new Seed(true, false);
    expect(client.connect).toBeCalledTimes(1);
  });
});
