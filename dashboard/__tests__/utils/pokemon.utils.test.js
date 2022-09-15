const pokemon = require("../../utils/pokemon.utils");

describe("pokemonNameLanguage", () => {
  test("Can return the name correctly", () => {
    const input = {
      names: [
        {
          name: "Found",
          language: {
            name: "de",
          },
        },
      ],
    };

    expect(pokemon.pokemonNameLanguage(input, "de")).toBe("Found");
  });
});

describe("itemNameLanguage", () => {
  test("Can retrieve item name correctly", () => {
    const input = {
      names: [
        {
          name: "Found",
          language: {
            name: "de",
          },
        },
      ],
    };

    expect(pokemon.itemNameLanguage(input, "de")).toEqual("Found");
  });
});

describe("itemFlavourTextLanguage", () => {
  test("Can return the name correctly", () => {
    const input = {
      flavor_text_entries: [
        {
          text: "- - -",
          version_group: { name: "firered-leafgreen" },
          language: {
            name: "de",
          },
        },
        {
          text: "Some good text!",
          version_group: { name: "black-white" },
          language: {
            name: "de",
          },
        },
      ],
    };
    const output = pokemon.itemFlavourTextLanguage(input, "de");
    expect(output).toEqual([
      {
        generation: 3,
        text: "n/a",
        generationName: "Feuer Rot / Blatt Grün",
      },
      {
        generation: 5,
        text: "Some good text!",
        generationName: "Schwarz / Weiss",
      },
    ]);
  });
});

describe.skip("sortMoves", () => {
  test("Sorts level only moves correctly", () => {
    const moves = [
      {
        method: "level",
      },
    ];
  });
  test.skip("Sorts mixed moves correctly", () => {});
});
