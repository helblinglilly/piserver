const acRouter = require("express").Router();
const error = require("../controllers/error.controller");
const acc = require("../controllers/ac.controller");

acRouter.get("/", acc.getAnimalCrossing);
acRouter.all("/", error.methodNotAllowed);

acRouter.all("/*", error.pageNotFound);

module.exports = acRouter;
