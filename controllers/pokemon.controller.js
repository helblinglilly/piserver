const fs = require("fs");
const utils = require("../utils");
const model = require("../models/pokemon.model");

exports.getPokemon = (_, res, next) => {
  res.render("pokemon");
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

  // Skip the steps below if there aren't any
  if (pkmnSpeciesPromises.length === 0) res.render("pokemon/item", { ...options });

  // Get data about each pokemon that holds this item
  Promise.all(pkmnSpeciesPromises)
    .then((entry) => {
      entry = entry.filter((x) => x !== undefined);

      entry.forEach((pkmn, index) => {
        model.receivePokemonSprite(pkmn.id).then((sprite) => {
          const details = {};
          details.id = id;
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
  let sourcePage = req.headers.referer.split("pokemon/")[1];
  if (sourcePage) {
    if (sourcePage.includes("blackwhite")) sourcePage = "Black and White";
    options.sourcePage = sourcePage;
  }

  // Search term
  const searchTerm = req.query.search;
  if (!searchTerm) {
    res.render("pokemon/search", { ...options });
    return;
  }
  options.searchTerm = searchTerm;

  let dictionaryData = model.dictionaryData();

  const promises = [];
  promises.push(findSearch(searchTerm, dictionaryData.names, "pokemon"));
  promises.push(findSearch(searchTerm, dictionaryData.items, "item"));
  promises.push(findSearch(searchTerm, dictionaryData.types, "type"));
  promises.push(findSearch(searchTerm, dictionaryData.moves, "move"));
  promises.push(findSearch(searchTerm, dictionaryData.abilities, "ability"));

  Promise.all(promises)
    .then((finds) => {
      finds = finds.filter((entry) => entry !== null);

      options.finds = finds;
      res.render("pokemon/search", { ...options });
    })
    .catch(() => {
      res.render("pokemon/search", { ...options });
    });
};

const findSearch = async (word, input, key) => {
  return new Promise((resolve, reject) => {
    if (!word || !input) reject();

    let finds = input.filter(
      (item) =>
        item.german.toLowerCase().includes(word.toLowerCase()) ||
        item.english.toLowerCase().includes(word.toLowerCase()),
    );
    if (finds.length === 0) resolve(null);

    finds = finds.slice(0, 10);

    const obj = {};
    obj[key] = finds;
    resolve(obj);
  });
};
