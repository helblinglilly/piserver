const utils = require("../utils");

describe("Utils Tests", () => {
  describe("todayIso()", () => {
    it("1.0 Separated by '/'", () => {
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
    it("1.0 Invalid Argumet - Empty Args", () => {
      expect(() => utils.addTime()).toThrow("Invalid Argument - empty");
    });
    it("1.1 Invalid Argument - Not of DateTime", () => {
      expect(() => utils.addTime('something', 123) ).toThrow("Invalid Argument - startTime is not DateTime");
    });
    it("1.2 Invalid Argument - Not an object", () => {
      expect(() => utils.addTime(new Date(), 123) ).toThrow("Invalid Argument - addTime is not an object");
    });
    it("2.0 Adds time correctly", () => {
      const startTime = new Date("01 Jan 1970 00:00:00 GMT");
      const addTime = { hours: 8, minutes: 30 };
      const output = utils.addTime(startTime, addTime);

      expect(output.toISOString()).toBe("1970-01-01T08:30:00.000Z");
    });
    it("2.1 Subtracts time correctly", () => {
      const startTime = new Date("01 Jan 1970 08:30:00 GMT");
      const addTime = { hours: -8, minutes: -30 };
      const output = utils.addTime(startTime, addTime);

      expect(output.toISOString()).toBe("1970-01-01T00:00:00.000Z");
    });
  });
});
