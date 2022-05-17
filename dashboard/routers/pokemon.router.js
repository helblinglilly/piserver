const pokemonRouter = require("express").Router();
const error = require("../controllers/error.controller");
const pc = require("../controllers/pokemon.controller");
const userSelection = require("../middleware/user.middleware");

pokemonRouter.get("/", userSelection, pc.getRoot);
pokemonRouter.all("/", userSelection, error.methodNotAllowed);

pokemonRouter.get("/blackwhite", userSelection, pc.getBlackWhite);
pokemonRouter.all("/blackwhite", userSelection, error.methodNotAllowed);

pokemonRouter.get("/search", userSelection, pc.getSearch);
pokemonRouter.all("/search", userSelection, error.methodNotAllowed);

pokemonRouter.get("/pkmn/:id", userSelection, pc.getPokemon);
pokemonRouter.all("/pkmn/:id", userSelection, error.methodNotAllowed);

pokemonRouter.get("/item/:id", userSelection, pc.getItem);
pokemonRouter.all("/item/:id", userSelection, error.methodNotAllowed);

pokemonRouter.post("/", userSelection);
pokemonRouter.all("/*", userSelection, error.pageNotFound);

module.exports = pokemonRouter;
