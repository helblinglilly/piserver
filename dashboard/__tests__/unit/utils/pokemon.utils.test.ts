import log from "loglevel";
log.disableAll();

import PokemonUtils, { Item, MoveSet } from "../../../utils/pokemon.utils";

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

    expect(PokemonUtils.pokemonNameLanguage(input, "de")).toBe("Found");
  });
});

describe("itemNameLanguage", () => {
  test("Can retrieve item name correctly", () => {
    const input: Item = {
      names: [
        {
          name: "Found",
          language: {
            name: "de",
          },
        },
      ],
      flavor_text_entries: [],
    };

    expect(PokemonUtils.itemNameLanguage(input, "de")).toEqual("Found");
  });
});

describe("itemFlavourTextLanguage", () => {
  test("Can return the name correctly", () => {
    const input: Item = {
      names: ["something"],
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
    const output = PokemonUtils.itemFlavourTextLanguage(input, "de");
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

describe("sortMoves", () => {
  const completeMoves: Array<MoveSet> = [
    {
      id: "574",
      type: "fairy",
      typeSprite: "https://static.wikia.nocookie.net/pokemon/images/7/74/Type_Fairy.gif",
      attackType: "special",
      attackTypeSprite: "https://i.stack.imgur.com/dS0qQ.png",
      moveNameGerman: "Säuselstimme",
      moveNameEnglish: "Disarming Voice",
      method: 6,
    },
    {
      id: "526",
      type: "normal",
      typeSprite: "https://static.wikia.nocookie.net/pokemon/images/6/61/Type_Normal.gif",
      attackType: "status",
      attackTypeSprite: "https://i.stack.imgur.com/LWKMo.png",
      moveNameGerman: "Kraftschub",
      moveNameEnglish: "Work Up",
      method: "TM/VM",
    },
    {
      id: "574",
      type: "fairy",
      typeSprite: "https://static.wikia.nocookie.net/pokemon/images/7/74/Type_Fairy.gif",
      attackType: "special",
      attackTypeSprite: "https://i.stack.imgur.com/dS0qQ.png",
      moveNameGerman: "Säuselstimme",
      moveNameEnglish: "Disarming Voice",
      method: 3,
    },
    {
      id: "812",
      type: "water",
      typeSprite: "https://static.wikia.nocookie.net/pokemon/images/e/ed/Type_Water.gif",
      attackType: "physical",
      attackTypeSprite: "https://i.stack.imgur.com/UATOp.png",
      moveNameGerman: "Rollwende",
      moveNameEnglish: "Flip Turn",
      method: "Erlernt - Tutor",
    },
    {
      id: "195",
      type: "normal",
      typeSprite: "https://static.wikia.nocookie.net/pokemon/images/6/61/Type_Normal.gif",
      attackType: "status",
      attackTypeSprite: "https://i.stack.imgur.com/LWKMo.png",
      moveNameGerman: "Abgesang",
      moveNameEnglish: "Perish Song",
      method: "Ei - Egg",
    },
  ];
  test("Sorts level only moves correctly", () => {
    const input: Array<MoveSet> = [
      {
        id: "id",
        type: "type",
        typeSprite: "typeSprite",
        attackType: "attackType",
        attackTypeSprite: "attackTypeSprite",
        moveNameGerman: "moveNameGerman",
        moveNameEnglish: "moveNameEnglish",
        method: 5,
      },
      {
        id: "id",
        type: "type",
        typeSprite: "typeSprite",
        attackType: "attackType",
        attackTypeSprite: "attackTypeSprite",
        moveNameGerman: "moveNameGerman",
        moveNameEnglish: "moveNameEnglish",
        method: 6,
      },
      {
        id: "id",
        type: "type",
        typeSprite: "typeSprite",
        attackType: "attackType",
        attackTypeSprite: "attackTypeSprite",
        moveNameGerman: "moveNameGerman",
        moveNameEnglish: "moveNameEnglish",
        method: 3,
      },
    ];
    const output = PokemonUtils.sortMoves(input);
    expect(output).toStrictEqual([
      {
        id: "id",
        type: "type",
        typeSprite: "typeSprite",
        attackType: "attackType",
        attackTypeSprite: "attackTypeSprite",
        moveNameGerman: "moveNameGerman",
        moveNameEnglish: "moveNameEnglish",
        method: 3,
      },
      {
        id: "id",
        type: "type",
        typeSprite: "typeSprite",
        attackType: "attackType",
        attackTypeSprite: "attackTypeSprite",
        moveNameGerman: "moveNameGerman",
        moveNameEnglish: "moveNameEnglish",
        method: 5,
      },
      {
        id: "id",
        type: "type",
        typeSprite: "typeSprite",
        attackType: "attackType",
        attackTypeSprite: "attackTypeSprite",
        moveNameGerman: "moveNameGerman",
        moveNameEnglish: "moveNameEnglish",
        method: 6,
      },
    ]);
  });
  test("Sorts mixed moves correctly", () => {
    const output = PokemonUtils.sortMoves(completeMoves);
    expect(output).toStrictEqual([
      {
        id: "195",
        type: "normal",
        typeSprite:
          "https://static.wikia.nocookie.net/pokemon/images/6/61/Type_Normal.gif",
        attackType: "status",
        attackTypeSprite: "https://i.stack.imgur.com/LWKMo.png",
        moveNameGerman: "Abgesang",
        moveNameEnglish: "Perish Song",
        method: "Ei - Egg",
      },
      {
        id: "574",
        type: "fairy",
        typeSprite:
          "https://static.wikia.nocookie.net/pokemon/images/7/74/Type_Fairy.gif",
        attackType: "special",
        attackTypeSprite: "https://i.stack.imgur.com/dS0qQ.png",
        moveNameGerman: "Säuselstimme",
        moveNameEnglish: "Disarming Voice",
        method: 3,
      },
      {
        id: "574",
        type: "fairy",
        typeSprite:
          "https://static.wikia.nocookie.net/pokemon/images/7/74/Type_Fairy.gif",
        attackType: "special",
        attackTypeSprite: "https://i.stack.imgur.com/dS0qQ.png",
        moveNameGerman: "Säuselstimme",
        moveNameEnglish: "Disarming Voice",
        method: 6,
      },
      {
        id: "526",
        type: "normal",
        typeSprite:
          "https://static.wikia.nocookie.net/pokemon/images/6/61/Type_Normal.gif",
        attackType: "status",
        attackTypeSprite: "https://i.stack.imgur.com/LWKMo.png",
        moveNameGerman: "Kraftschub",
        moveNameEnglish: "Work Up",
        method: "TM/VM",
      },
      {
        id: "812",
        type: "water",
        typeSprite:
          "https://static.wikia.nocookie.net/pokemon/images/e/ed/Type_Water.gif",
        attackType: "physical",
        attackTypeSprite: "https://i.stack.imgur.com/UATOp.png",
        moveNameGerman: "Rollwende",
        moveNameEnglish: "Flip Turn",
        method: "Erlernt - Tutor",
      },
    ]);
  });
});
