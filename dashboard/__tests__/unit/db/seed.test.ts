import log from "loglevel";
import Seed from "../../../db/seed";
import Client from "pg";
import format from "pg-format";

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
  test("Connects to the database", () => {
    new Seed(true);
    expect(client.connect).toBeCalledTimes(1);
  });
  describe("usertable", () => {
    test("Would drop database if told to do so", async () => {
      const seed = new Seed(true);
      await seed.usertable();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS usertable");
    });

    test("Would not drop database if told to do so", async () => {
      const seed = new Seed(false);
      await seed.usertable();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS usertable");
    });

    test("Would create usertable and insert an entry", async () => {
      const seed = new Seed(false);
      await seed.usertable();
      expect(client.query.mock.calls).toEqual([
        [
          `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
        ],
        [`INSERT INTO usertable (ip, username) VALUES ('127.0.0.1', 'joel')`],
      ]);
    });

    test("Would create usertable and insert a custom entry", async () => {
      const seed = new Seed(false);
      await seed.usertable([{ ip: "127.0.0.2", username: "user1" }]);
      expect(client.query.mock.calls).toEqual([
        [
          `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
        ],
        [`INSERT INTO usertable (ip, username) VALUES ('127.0.0.2', 'user1')`],
      ]);
    });
  });

  describe("timesheet", () => {
    test("Would drop database if told to do so", async () => {
      const seed = new Seed(true);
      await seed.timesheet();
      expect(client.query).toHaveBeenCalledWith("DROP TABLE IF EXISTS timesheet");
    });

    test("Would not drop database if told to do so", async () => {
      const seed = new Seed(false);
      await seed.timesheet();
      expect(client.query).not.toHaveBeenCalledWith("DROP TABLE IF EXISTS timesheet");
    });

    test.skip("Would create timesheet and insert an entry", async () => {
      const seed = new Seed(false);
      await seed.timesheet();
      const today = new Date();
      expect(client.query.mock.calls).toEqual([
        [
          `CREATE TABLE IF NOT EXISTS timesheet (id SERIAL PRIMARY KEY, username VARCHAR NOT NULL, day_date DATE NOT NULL, clock_in TIME NOT NULL, break_in TIME, break_out TIME, clock_out TIME );`,
        ],
        [
          format(
            `INSERT INTO timesheet
  (username, day_date, clock_in, break_in, break_out, clock_out)
  VALUES
  ('joel', %L, '09:00:00', NULL, NULL, NULL),
  ('joel', %L, '09:00:00', '13:15:00', NULL, NULL),
  ('joel', %L, '09:15:00', '13:00:00', '14:00:00', NULL),
  ('joel', %L, '09:45:00', '13:00:00', '13:45:00', '16:15:00'),
  ('joel', %L, '09:00:00', '13:00:00', '14:00:00', '17:00:00'),
  ('joel', %L, '09:00:00', '13:00:00', '14:00:00', '18:00:00')
  `,
            today,
            new Date(today.getDate() - 1),
            new Date(today.getDate() - 2),
            new Date(today.getDate() - 3),
            new Date(today.getDate() - 4),
            new Date(today.getDate() - 5),
          ),
        ],
      ]);
    });

    test.skip("Would create usertable and insert a custom entry", async () => {
      const seed = new Seed(false);
      await seed.usertable([{ ip: "127.0.0.2", username: "user1" }]);
      expect(client.query.mock.calls).toEqual([
        [
          `CREATE TABLE IF NOT EXISTS usertable (ip varchar(255) NOT NULL PRIMARY KEY, username varchar(255) NOT NULL)`,
        ],
        [`INSERT INTO usertable (ip, username) VALUES ('127.0.0.2', 'user1')`],
      ]);
    });
  });
});
