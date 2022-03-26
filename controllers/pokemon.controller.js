const pkmnModel = require("../models/pokemon.model");
const fs = require("fs").promises;
const axios = require("axios");
const wrapper = require("axios-cache-plugin");

const pokemonData = {};

let http = wrapper(axios, {
  maxCacheSize: 15,
});
exports.getPokemon = (_, res, next) => {
  res.render("pokemon");
  // some test
};

exports.getItem = async (req, res, next) => {
  const options = {};
  const id = req.params.id;

  const itemResponse = await http({
    url: `https://pokeapi.co/api/v2/item/${id}`,
    method: "get",
  });
  // const itemResponse = await axios.get(`https://pokeapi.co/api/v2/item/${id}`);
  const item = itemResponse.data;

  options.item = item;
  console.log(item);
  res.render("pokemon/detail-item", { ...options });
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
  let data = await fs.readFile("./pokedata/data.json", "utf-8");
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
