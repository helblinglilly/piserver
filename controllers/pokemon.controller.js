const pkmnModel = require("../models/pokemon.model");

exports.getPokemon = (_, res, next) => {
  res.render("pokemon/index", { host: "http://127.0.0.1:9090" });
};
