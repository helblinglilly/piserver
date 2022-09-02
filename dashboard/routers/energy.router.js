const energyRouter = require("express").Router();
const error = require("../controllers/error.controller");
const ec = require("../controllers/energy.controller");
const userSelection = require("../middleware/user.middleware");

energyRouter.get("/", userSelection, ec.getRoot);

energyRouter.get("/insert_electric", userSelection, ec.getInsertElectric);
energyRouter.post("/insert_electric", userSelection, ec.postInsert);

energyRouter.get("/insert_gas", userSelection, ec.getInsertGas);
energyRouter.post("/insert_gas", userSelection, ec.postInsert);

energyRouter.all("/*", error.pageNotFound);

module.exports = energyRouter;
