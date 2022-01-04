const setup = require("../setup");
const pkmnModel = require("../models/pokemon.model");

exports.getPokemon = (_, res, next) => {
  res.render("pokemon/index", { host: setup.HOST });
};
