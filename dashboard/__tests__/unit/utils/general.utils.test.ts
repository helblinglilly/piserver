import log from "loglevel";
log.disableAll();

import general from "../../../utils/general.utils";

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

  describe("replaceNewlineTabWithSpace", () => {
    test("Preserves regular string", () => {
      const input = "Hello there, world";
      const output = general.replaceNewlineTabWithSpace(input);
      expect(output).toBe(input);
    });

    test("Removes a tab", () => {
      const input = "Hello there,   world";
      const output = general.replaceNewlineTabWithSpace(input);
      expect(output).toBe("Hello there, world");
    });

    test("Removes a newline", () => {
      const input = `Hello there, 
      world`;
      const output = general.replaceNewlineTabWithSpace(input);
      expect(output).toBe("Hello there, world");
    });

    test("Can deal with a query string", () => {
      const input = `SELECT * 
      FROM test_table 
      WHERE input='hi'`;
      const output = general.replaceNewlineTabWithSpace(input);
      expect(output).toBe("SELECT * FROM test_table WHERE input='hi'");
    });
  });
});
