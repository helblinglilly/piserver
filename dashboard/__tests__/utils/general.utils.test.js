const log = require("loglevel");
log.disableAll();

const general = require("../../utils/general.utils");

describe("padWithLeadingCharacters", () => {
  test("Works correctly with string inputs", () => {
    expect(general.padWithLeadingCharacters("2", 5, "A")).toBe("AAAA2");
  });
});

describe("compareObjectsOnAttribute", () => {
  test("Can be used in Array.sort", () => {
    const input = [{ value: 2 }, { value: 1 }, { value: 3 }];
    const output = input.sort((a, b) => general.compareObjectsOnAttribute(a, b, "value"));
    expect(output).toStrictEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
  });
});
