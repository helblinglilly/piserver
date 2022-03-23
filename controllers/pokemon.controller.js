const pkmnModel = require("../models/pokemon.model");

exports.getPokemon = (_, res, next) => {
  res.render("pokemon/index");
  // some test
};

exports.getBlackWhite = (req, res, next) => {
  const lowestPokedexId = 494;
  const highestPokedexId = 649;
  res.render("pokemon/blackwhite");
};
