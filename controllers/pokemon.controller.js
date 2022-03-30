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

  options.germanName = utils.pokemonNameLanguage(species, "de");
  options.englishName = utils.pokemonNameLanguage(species, "en");

  options.spriteFront = await model.receivePokemonSpriteFront(options.id);
  options.spriteBack = await model.receivePokemonSpriteBack(options.id);
  await model.receivePokemonSpriteShinyFront(options.id);
  await model.receivePokemonSpriteShinyBack(options.id);

  options.evolutionChain = await model.receiveEvolutionChain(species.evolution_chain.url);

  options.evolutionChain.forEach((evolution) => {
    // console.log(evolution);
    evolution.evolutions.forEach((sibling) => {
      console.log(sibling);
    });
  });
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
        entry.english.toLowerCase().includes(word.toLowerCase()),
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
