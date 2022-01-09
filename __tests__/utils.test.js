const utils = require("../utils");

describe("Utils Tests", () => {
  describe("todayIso()", () => {
    it("Separated by '/'", () => {
      const input = utils.todayIso();

      const year = input.substr(0, 4);
      expect(year.length).toBe(4);

      expect(input[4]).toBe("-");

      const month = input.substr(5, 2);
      expect(month.length).toBe(2);

      expect(input[7]).toBe("-");

      const day = input.substr(8, 2);
      expect(day.length).toBe(2);

      expect(input.length).toBe(10);
    });
  });
  describe("addTime(startTime, { hours: number, minutes: number})", () => {
    it("Adds time correctly", () => {
      const startTime = new Date("01 Jan 1970 00:00:00 GMT");
      const addTime = { hours: 8, minutes: 30 };
      const output = utils.addTime(startTime, addTime);

      expect(output.toISOString()).toBe("1970-01-01T08:30:00.000Z");
    });
    it("Subtracts time correctly", () => {
      const startTime = new Date("01 Jan 1970 08:30:00 GMT");
      const addTime = { hours: -8, minutes: -30 };
      const output = utils.addTime(startTime, addTime);

      expect(output.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    });
  });
});
