export interface Item {
  names: Array<any>;
  flavor_text_entries: Array<any>;
}

export interface LanguageCodeEntry {
  name: string;
}

export interface LanguageEntry {
  language: LanguageCodeEntry;
  name: string;
  text: string;
  version_group: VersionGroup;
}

export interface VersionGroup {
  name: keyof GenerationLookup;
  url: string;
}

export interface GenerationLookup {
  "red-blue": GenerationEntry;
  yellow: GenerationEntry;
  "gold-silver": GenerationEntry;
  crystal: GenerationEntry;
  "ruby-sapphire": GenerationEntry;
  emerald: GenerationEntry;
  "firered-leafgreen": GenerationEntry;
  colosseum: GenerationEntry;
  xd: GenerationEntry;
  "diamond-pearl": GenerationEntry;
  platinum: GenerationEntry;
  "heartgold-soulsilver": GenerationEntry;
  "black-white": GenerationEntry;
  "black-2-white-2": GenerationEntry;
  "x-y": GenerationEntry;
  "omega-ruby-alpha-sapphire": GenerationEntry;
  "sun-moon": GenerationEntry;
  "ultra-sun-ultra-moon": GenerationEntry;
  "lets-go-pikachu-lets-go-eevee": GenerationEntry;
  "sword-shield": GenerationEntry;
}

export interface GenerationEntry {
  de: string;
  en: string;
  generation: Number;
}

export interface GenerationReturn {
  generation: GenerationEntry["generation"];
  generationName: string | Number;
  text: string;
}

export interface MoveSet {
  id: string;
  type: string;
  typeSprite: string;
  attackType: string;
  attackTypeSprite: string;
  moveNameGerman: string;
  moveNameEnglish: string;
  method: "Erlernt - Tutor" | "Ei - Egg" | "TM/VM" | number;
}

export class PokemonUtils {
  static highestPokedexEntry: number = 898;

  static pokemonNameLanguage = (species: any, languageCode: string): string => {
    let name: string = "";

    species.names.forEach((entry: LanguageEntry) => {
      if (entry.language.name === languageCode) {
        name = entry.name;
      }
    });

    return name;
  };

  static itemNameLanguage = (item: Item, languageCode: string): string => {
    let name = "";

    item.names.forEach((entry: LanguageEntry) => {
      if (entry.language.name === languageCode) name = entry.name;
    });

    return name;
  };

  static itemFlavourTextLanguage = (
    item: Item,
    languageCode: keyof GenerationEntry,
  ): Array<GenerationReturn> => {
    const texts: Array<GenerationReturn> = [];

    let previousText: string = "";

    item.flavor_text_entries.forEach((entry: LanguageEntry) => {
      if (entry.language.name === languageCode) {
        if (previousText !== entry.text) {
          const generation: GenerationEntry = this.generationLanguage(
            entry.version_group.name,
          );

          const i: GenerationReturn = {
            generation: generation.generation,
            text: "n/a",
            generationName: generation[languageCode],
          };
          entry.text = entry.text.replace(/\n/g, " ");

          if (entry.text !== "- - -") {
            i.generation = generation.generation;
            i.generationName = generation[languageCode];
            i.text = entry.text;
          }

          let found = false;
          texts.forEach((text) => {
            if (text.text == i.text.toString()) found = true;
          });

          if (!found) texts.push(i);

          previousText = entry.text;
        }
      }
    });

    return texts;
  };

  static generationLanguage = (version_group_name: keyof GenerationLookup): any => {
    const lookup: GenerationLookup = {
      "red-blue": {
        de: "Rot / Blau",
        en: "Red / Blue",
        generation: 1,
      },
      yellow: {
        de: "Gelb",
        en: "Yellow",
        generation: 1,
      },
      "gold-silver": {
        de: "Gold / Silber",
        en: "Gold / Silver",
        generation: 2,
      },
      crystal: {
        de: "Kristall",
        en: "Crystal",
        generation: 3,
      },
      "ruby-sapphire": {
        de: "Rubin / Saphir",
        en: "Ruby / Sapphire",
        generation: 3,
      },
      emerald: {
        de: "Smaragd",
        en: "Emerald",
        generation: 3,
      },
      "firered-leafgreen": {
        de: "Feuer Rot / Blatt Grün",
        en: "Fire Red / Leaf Green",
        generation: 3,
      },
      colosseum: {
        de: "Kolosseum",
        en: "Colosseum",
        generation: 3,
      },
      xd: {
        de: "XD",
        en: "XD",
        generation: 3,
      },
      "diamond-pearl": {
        de: "Diamant / Perle",
        en: "Diamond / Perl",
        generation: 4,
      },
      platinum: {
        de: "Platin",
        en: "Platinum",
        generation: 4,
      },
      "heartgold-soulsilver": {
        de: "Heartgold / Soulsilver",
        en: "Heartgold / Soulsilver",
        generation: 4,
      },
      "black-white": {
        de: "Schwarz / Weiss",
        en: "Black / White",
        generation: 5,
      },
      "black-2-white-2": {
        de: "Schwarz 2 / Weiss 2",
        en: "Black 2 / White 2",
        generation: 5,
      },
      "x-y": {
        de: "X / Y",
        en: "X / Y",
        generation: 6,
      },
      "omega-ruby-alpha-sapphire": {
        de: "Omega Rubin / Alpha Saphir",
        en: "Omega Ruby / Alpha Sapphire",
        generation: 6,
      },
      "sun-moon": {
        de: "Sonne / Mond",
        en: "Sun / Moon",
        generation: 7,
      },
      "ultra-sun-ultra-moon": {
        de: "Ultra Sonne / Ultra Mond",
        en: "Ultra Sun / Ultra Moon",
        generation: 7,
      },
      "lets-go-pikachu-lets-go-eevee": {
        de: "Let's Go Pikachu / Evoli",
        en: "Let's Go Pikachu / Eevee",
        generation: 7,
      },
      "sword-shield": {
        de: "Schwert / Schild",
        en: "Sword / Shield",
        generation: 8,
      },
    };

    return lookup[version_group_name];
  };

  static sortMoves = (moves: Array<MoveSet>): Array<MoveSet> => {
    const level: Array<MoveSet> = [];
    const tvm: Array<MoveSet> = [];
    const tutor: Array<MoveSet> = [];
    const egg: Array<MoveSet> = [];
    const result: Array<Array<MoveSet>> = [];

    moves.forEach((move) => {
      if (move.method === "Ei - Egg") egg.push(move);
      else if (move.method === "TM/VM") tvm.push(move);
      else if (move.method === "Erlernt - Tutor") tutor.push(move);
      else level.push(move);
    });

    result.push(egg);
    level.sort((a, b) => {
      return parseInt(a.method.toString()) - parseInt(b.method.toString());
    });
    result.push(level);
    result.push(tvm);
    result.push(tutor);
    return result.flat();
  };
}

export default PokemonUtils;
