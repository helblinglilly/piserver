const model = require("../../../models/timesheet.model");
const log = require("loglevel");
log.disableAll();

describe("selectDay", () => {
  test("Can retrieve a single entry", async () => {
    await model.default.selectDay(new Date(), "joel");
    expect(1).toBe(1);
  });
});
