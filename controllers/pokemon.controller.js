const pkmnModel = require("../models/pokemon.model");

exports.getPokemon = (_, res, next) => {
  res.render("pokemon/index");
};
