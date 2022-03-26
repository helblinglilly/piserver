const fs = require("fs");
const utils = require("../utils");
const cache = require("../cache/cachemanager");

exports.getPokemon = (_, res, next) => {
  res.render("pokemon");
};

exports.getItem = async (req, res, next) => {
  const options = {};
  const id = req.params.id;

  const item = await cache.receivePokemonItemData(id);
  options.item = item;
  options.germanName = utils.itemNameLanguage(item, "de");
  options.englishName = utils.itemNameLanguage(item, "en");

  const imagePath = await cache.receivePokemonItemSprite(item.name);
  options.spritePath = imagePath;

  options.germanFlavourTexts = utils.itemFlavourTextLanguage(item, "de");
  options.englishFlavourTexts = utils.itemFlavourTextLanguage(item, "en");

  options.held_by_summaries = [];

  const promises = [];

  if (item.held_by_pokemon.length > 0) {
    item.held_by_pokemon.forEach((details) => {
      const id = details.pokemon.url.split("/")[6];
      promises.push(cache.receivePokemonSpeciesData(id));
    });
  }

  if (promises.length === 0) {
    res.render("pokemon/item", { ...options });
    return;
  }

  Promise.all(promises)
    .then((entry) => {
      entry = entry.filter((x) => x !== undefined);

      entry.forEach((pkmn, index) => {
        const details = {};
        if (pkmn) {
          cache.receivePokemonSprite(pkmn.id).then((sprite) => {
            details.sprite = sprite;

            details.german = utils.pokemonNameLanguage(pkmn, "de");
            const english = utils.pokemonNameLanguage(pkmn, "en");
            details.english = english !== details.german ? english : "";

            options.held_by_summaries.push(details);
            details.id = id;

            if (index === entry.length - 1) {
              res.render("pokemon/item", { ...options });
            }
          });
        }
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

  // Load files
  let data = fs.readFileSync("./pokedata/data.json", "utf-8");
  data = JSON.parse(data);

  const promises = [];
  promises.push(findSearch(searchTerm, data.names, "pokemon"));
  promises.push(findSearch(searchTerm, data.items, "item"));
  promises.push(findSearch(searchTerm, data.types, "type"));
  promises.push(findSearch(searchTerm, data.moves, "move"));
  promises.push(findSearch(searchTerm, data.abilities, "ability"));

  Promise.all(promises)
    .then((finds) => {
      finds = finds.filter((item) => item !== null);

      options.finds = finds;
      res.render("pokemon/search", { ...options });
      data = null;
    })
    .catch(() => {
      res.render("pokemon/search", { ...options });
      data = null;
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
