import { describe, expect, test } from "@jest/globals";

const log = require("loglevel");
log.disableAll();

import date from "../../../utils/date.utils";

describe("daysBetweenTwoDates", () => {
  test("Returns 1 for exact date inputs", () => {
    const a = new Date("2022 01 01");
    const b = new Date("2022 01 02");
    const output = date.daysBetweenTwoDates(a, b);
    expect(output).toBe(1);
  });

  test("Returns -1 for exact date inputs", () => {
    const a = new Date("2022 01 02");
    const b = new Date("2022 01 01");
    const output = date.daysBetweenTwoDates(a, b);
    expect(output).toBe(-1);
  });
});

describe("toUserFriendlyStringNoYearLocal", () => {
  test("Pads with 0s correct", () => {
    const input = new Date("2022 01 01");
    const output = date.toUserFriendlyStringNoYearLocal(input);
    expect(output).toBe("Sat, 01/01");
  });

  test("Is in DAY DD/MM format", () => {
    const input = new Date("2022 03 05");
    const output = date.toUserFriendlyStringNoYearLocal(input);
    expect(output).toBe("Sat, 05/03");
  });
});

describe("addTime", () => {
  test("Adds time correct", () => {
    const expected = "2023-02-02T01:01:01.000Z";
    const startTime = new Date("2022 01 01");
    const outputDate = date.addTime(startTime, 1, 1, 1, 1, 1, 1);
    const outputString = outputDate.toISOString();

    expect(outputString).toEqual(expected);
  });
});

describe("isShortTime", () => {
  test("Identifies 12:15 correctly", () => {
    const input = "12:15";
    const output = date.isShortTime(input);
    expect(output).toBe(true);
  });

  test("Identifies 03:05 correctly", () => {
    const input = "03:05";
    const output = date.isShortTime(input);
    expect(output).toBe(true);
  });

  test("Denies 3:5", () => {
    const input = "3:5";
    const output = date.isShortTime(input);
    expect(output).toBe(false);
  });

  test("Denies 60:60", () => {
    const input = "60:60";
    const output = date.isShortTime(input);
    expect(output).toBe(false);
  });
});

describe("dateToHHMMLocal", () => {
  test.skip("Does convert time to local timezone - Summertime", () => {
    const input = new Date("2020-04-13T12:00:00.000+08:00");
    const output = date.dateToHHMMLocal(input);

    expect(output).toBe("05:00");
  });

  test.skip("Does convert time to local timezone - Daylight Saving", () => {
    const input = new Date("2020-04-13T12:00:00.000+08:00");
    const output = date.dateToHHMMLocal(input);

    expect(output).toBe("04:00");
  });
});

describe("dateToHHMMUTC", () => {
  test("Does convert time with timezone offset to UTC", () => {
    // +8 does not observe Daylight Saving
    const input = new Date("2020-04-13T12:00:00.000+08:00");
    const output = date.dateToHHMMUTC(input);

    expect(output).toBe("04:00");
  });
});

describe("todayISOUTC", () => {
  test("Returns a string", () => {
    const output = date.todayISOUTC();
    expect(output.length).toBe(10);
  });
});

describe.skip("constructUTCDateFromLocal", () => {
  // This test should really be redundant.
});

describe("copyTimeObject", () => {
  const original = new Date("2022 01 01");
  const copy = date.copyTimeObject(original);

  expect(copy).not.toBe(original);

  original.setFullYear(1970);
  expect(copy).not.toEqual(original);
});

describe("setTime", () => {
  test("Will set time correctly", () => {
    const input = new Date();
    const inputDate = input.toISOString().split("T")[0];
    const output = date.setUTCTime(input, 9, 30, 15);

    expect(output.toISOString()).toBe(`${inputDate}T09:30:15.000Z`);
  });
});

describe("setUTCTime", () => {
  test("Will set time correctly", () => {
    const input = new Date();
    const inputDate = input.toISOString().split("T")[0];
    const output = date.setTime(input, 9, 30, 15);

    expect(output.toTimeString().split(" ")[0]).toBe(`09:30:15`);
  });
});