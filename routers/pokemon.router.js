const pokemonRouter = require("express").Router();
const error = require("../controllers/error.controller");
const pc = require("../controllers/pokemon.controller");

pokemonRouter.get("/", pc.getPokemon);
pokemonRouter.all("/", error.methodNotAllowed);

pokemonRouter.get("/blackwhite", pc.getBlackWhite);
pokemonRouter.all("/blackwhite", error.methodNotAllowed);

pokemonRouter.get("/search", pc.getSearch);
pokemonRouter.all("/search", error.methodNotAllowed);

pokemonRouter.post("/");
pokemonRouter.all("/*", error.pageNotFound);

module.exports = pokemonRouter;
