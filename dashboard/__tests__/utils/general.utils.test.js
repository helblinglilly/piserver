const general = require("../../utils/general.utils");

describe("padWithLeadingCharacters", () => {
  test("Works correctly with string inputs", () => {
    expect(general.padWithLeadingCharacters("2", 5, "A")).toBe("AAAA2");
  });
});
