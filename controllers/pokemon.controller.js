const { host } = require("../setup");
const pkmnModel = require("../models/pokemon.model");

exports.getPokemon = (_, res, next) => {
  console.log(host);
  res.render("pokemon/index", { host: host });
};
