const acRouter = require("express").Router();
const error = require("../controllers/error.controller");
const acc = require("../controllers/ac.controller");

acRouter.get("/", acc.getAnimalCrossing);
acRouter.all("/", error.methodNotAllowed);

module.exports = acRouter;
