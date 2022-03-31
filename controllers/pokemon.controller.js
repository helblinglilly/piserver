const fs = require("fs");
const utils = require("../utils");
const model = require("../models/pokemon.model");
const error = require("./error.controller");

exports.getRoot = (_, res, next) => {
  res.render("pokemon");
};

exports.getPokemon = async (req, res, next) => {
  const options = {};
  options.id = req.params.id;

  // 404
  if (
    req.params.id <= 0 ||
    req.params.id > utils.highestPokedexEntry ||
    options.id == "undefined"
  ) {
    error.pageNotFound(req, res);
    return;
  }

  const species = await model.receivePokemonSpeciesData(options.id);
  const pokemon = await model.receivePokemonData(options.id);
  // const dictionaryData = model.dictionaryData();

  options.germanName = utils.pokemonNameLanguage(species, "de");
  options.englishName = utils.pokemonNameLanguage(species, "en");

  options.spriteFront = await model.receivePokemonSpriteFront(options.id);
  options.spriteBack = await model.receivePokemonSpriteBack(options.id);
  await model.receivePokemonSpriteShinyFront(options.id);
  await model.receivePokemonSpriteShinyBack(options.id);

  options.evolutionChain = await model.receiveEvolutionChain(species.evolution_chain.url);

  options.type1 = {};
  options.type1.sprite = model.receiveTypeSprite(pokemon.types[0].type.name);
  if (pokemon.types[1]) {
    options.type2 = {};
    options.type2.sprite = model.receiveTypeSprite(pokemon.types[1].type.name);
  }

  options.growth = species.growth_rate.name;

  if (utils.generationLanguage(req.query.game)) {
    options.game = {
      name: req.query.game,
      german: utils.generationLanguage(req.query.game).de,
      english: utils.generationLanguage(req.query.game).en,
    };
  }

  options.moves = [];
  let i = 0;
  for (const pokemonMove of pokemon.moves) {
    for (const versionGroupDetail of pokemonMove.version_group_details) {
      const version = options.moves.find(
        (version) => version.game.name === versionGroupDetail.version_group.name,
      );

      const moveData = await model.receiveAttackData(pokemonMove.move.url);
      const move = {};
      move.id =
        pokemonMove.move.url.split("/")[pokemonMove.move.url.split("/").length - 2];
      move.type = moveData.type.name;
      move.typeSprite = model.receiveTypeSprite(move.type);
      move.attackType = moveData.damage_class.name;
      move.attackTypeSirte = move.moveNameGerman = utils.itemNameLanguage(moveData, "de");
      move.moveNameEnglish = utils.itemNameLanguage(moveData, "en");

      let versionGroup;
      pokemonMove.version_group_details.forEach((detail) => {
        if (detail.version_group.name === options.game.name) {
          versionGroup = detail;
        }
      });

      if (versionGroup) {
        if (versionGroup.move_learn_method.name === "machine") {
          move.method = "Machine";
        } else if (versionGroup.move_learn_method.name === "level-up") {
          move.method = `Lv ${versionGroup.level_learned_at}`;
        } else if (versionGroup.move_learn_method.name === "tutor") {
          move.method = `Erlernt - Tutor`;
        }
      }

      if (!version) {
        options.moves.push({
          game: {
            name: versionGroupDetail.version_group.name,
            details: utils.generationLanguage(versionGroupDetail.version_group.name),
          },
          moves: [move],
        });
      } else {
        version.moves.push(move);
      }
    }
  }

  for (const [key, value] of Object.entries(options.moves)) {
    console.log(key, value.moves);
    if (key === 0) {
      utils.sortMoves(value.moves);
    }
  }

  res.render("pokemon/pkmn", { ...options });
  return;
};
exports.getItem = async (req, res, next) => {
  const options = {};
  const id = req.params.id;

  const item = await model.receivePokemonItemData(id);
  options.spritePath = await model.receivePokemonItemSprite(item.name);

  options.item = item;
  options.held_by_summaries = [];

  options.germanName = utils.itemNameLanguage(item, "de");
  options.englishName = utils.itemNameLanguage(item, "en");
  options.germanFlavourTexts = utils.itemFlavourTextLanguage(item, "de");
  options.englishFlavourTexts = utils.itemFlavourTextLanguage(item, "en");

  // Set up for pokemon that hold this item
  const pkmnSpeciesPromises = [];
  if (item.held_by_pokemon.length > 0) {
    item.held_by_pokemon.forEach((pkmn) => {
      const id = pkmn.pokemon.url.split("/")[6];
      if (id > 0 && id <= utils.highestPokedexEntry) {
        pkmnSpeciesPromises.push(model.receivePokemonSpeciesData(id));
      }
    });
  }

  // For unused items
  if (options.item.effect_entries.length === 0)
    options.item.effect_entries.push({ effect: "Unused" });

  // Skip the steps below if there aren't any
  if (pkmnSpeciesPromises.length === 0) {
    res.render("pokemon/item", { ...options });
    return;
  }

  // Get data about each pokemon that holds this item
  Promise.all(pkmnSpeciesPromises)
    .then((entry) => {
      entry = entry.filter((x) => x !== undefined);

      entry.forEach((pkmn, index) => {
        model.receivePokemonSpriteFront(pkmn.id).then((sprite) => {
          const details = {};
          details.id = pkmn.id;
          details.sprite = sprite;

          details.german = utils.pokemonNameLanguage(pkmn, "de");
          const english = utils.pokemonNameLanguage(pkmn, "en");
          details.english = english !== details.german ? english : "";

          options.held_by_summaries.push(details);

          if (index === entry.length - 1) {
            res.render("pokemon/item", { ...options });
          }
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.render("pokemon/item", { ...options });
    });
};

exports.getBlackWhite = (req, res, next) => {
  const lowestPokedexId = 494;
  const highestPokedexId = 649;
  res.render("pokemon/blackwhite");
};

exports.getSearch = async (req, res, next) => {
  const options = {};

  // Referer
  if (req.headers.referer) {
    let sourcePage = req.headers.referer.split("pokemon/")[1];
    if (sourcePage) {
      if (sourcePage.includes("blackwhite")) sourcePage = "Black and White";
    }
  } else {
    options.sourcePage = "Pokemon";
  }

  // Search term
  if (!req.query.search) {
    res.render("pokemon", { ...options });
    return;
  }
  const searchTerm = req.query.search;
  if (!searchTerm) {
    res.render("pokemon/search", { ...options });
    return;
  }
  options.searchTerm = searchTerm;

  let dictionaryData = model.dictionaryData();

  const searchPromises = [];
  searchPromises.push(
    findSearch(
      searchTerm,
      dictionaryData.names,
      "pokemon",
      model.receivePokemonSpriteFront,
    ),
  );
  searchPromises.push(
    findSearch(searchTerm, dictionaryData.items, "item", model.receivePokemonItemSprite),
  );
  searchPromises.push(findSearch(searchTerm, dictionaryData.types, "type"));
  searchPromises.push(findSearch(searchTerm, dictionaryData.moves, "move"));
  searchPromises.push(findSearch(searchTerm, dictionaryData.abilities, "ability"));

  Promise.all(searchPromises)
    .then((finds) => {
      finds = finds.filter((entry) => entry !== null);

      options.finds = finds;
      res.render("pokemon/search", { ...options });
    })
    .catch(() => {
      res.render("pokemon/search", { ...options });
    });
};

const findSearch = (word, input, key, spriteMethod) => {
  return new Promise((resolve, reject) => {
    if (!word || !input) reject();

    // Find items
    let finds = input.filter(
      (entry) =>
        entry.german.toLowerCase().includes(word.toLowerCase()) ||
        entry.english.toLowerCase().includes(word.toLowerCase()) ||
        entry.id == word,
    );

    // Size adjustment
    if (finds.length === 0) resolve(null);
    finds = finds.slice(0, 10);

    const finish = () => {
      const obj = {};
      obj[key] = finds;
      resolve(obj);
    };

    // Get sprites from cache if there is a sprite needed
    if (spriteMethod) {
      finds.forEach(async (entry, index) => {
        if (key === "pokemon") entry.sprite = await spriteMethod(entry.id);
        if (key === "item") entry.sprite = await spriteMethod(entry.english_id);

        if (index === finds.length - 1) finish();
      });
    } else finish();
  });
};
