const pokemonRouter = require("express").Router();
const error = require("../controllers/error.controller");
const pc = require("../controllers/pokemon.controller");

pokemonRouter.get("/", pc.getPokemon);
pokemonRouter.all("/", error.methodNotAllowed);

pokemonRouter.get("/blackwhite", pc.getBlackWhite);

pokemonRouter.all("/*", error.pageNotFound);

module.exports = pokemonRouter;
