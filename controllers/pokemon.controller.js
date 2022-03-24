const pkmnModel = require("../models/pokemon.model");
const fs = require("fs").promises;

const pokemonData = {};

exports.getPokemon = (_, res, next) => {
  res.render("pokemon/index");
  // some test
};

exports.getBlackWhite = (req, res, next) => {
  const lowestPokedexId = 494;
  const highestPokedexId = 649;
  res.render("pokemon/blackwhite");
};

exports.getSearch = (req, res, next) => {
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
  const promises = [];
  promises.push(fs.readFile("./pokedata/abilities.json", "utf-8"));
  // promises.push(fs.readFile("./pokedata/items.json", "utf-8"));
  // promises.push(fs.readFile("./pokedata/moves.json", "utf-8"));
  // promises.push(fs.readFile("./pokedata/names.json", "utf-8"));
  promises.push(fs.readFile("./pokedata/types.json", "utf-8"));

  Promise.all(promises)
    .then((values) => {
      values = JSON.parse(values);
      console.log(values);
      res.render("pokemon/search", { ...options });
    })
    .catch((err) => {
      console.log(err);
    });
};
