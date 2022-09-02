const energyRouter = require("express").Router();
const error = require("../controllers/error.controller");
const ec = require("../controllers/energy.controller");
const userSelection = require("../middleware/user.middleware");

energyRouter.get("/", userSelection, ec.getRoot);

energyRouter.all("/*", error.pageNotFound);

module.exports = energyRouter;
