const energyRouter = require("express").Router();
const error = require("../controllers/error.controller");
const ec = require("../controllers/energy.controller");
const userSelection = require("../middleware/user.middleware");

energyRouter.get("/", userSelection, ec.getRoot);
energyRouter.all("/", error.methodNotAllowed);

energyRouter.get("/bills", userSelection, ec.getBills);
energyRouter.all("/bills", error.methodNotAllowed);

energyRouter.get("/insert_electric", userSelection, ec.getInsertElectric);
energyRouter.post("/insert_electric", userSelection, ec.postInsert);
energyRouter.all("/insert_electric", error.methodNotAllowed);

energyRouter.get("/insert_gas", userSelection, ec.getInsertGas);
energyRouter.post("/insert_gas", userSelection, ec.postInsert);
energyRouter.all("/insert_gas", error.methodNotAllowed);

energyRouter.get("/view_monthly", userSelection, ec.getViewMonthly);
energyRouter.all("/view_monthly", error.methodNotAllowed);

energyRouter.get("/view_hourly", userSelection, ec.getViewHourly);
energyRouter.all("/view_hourly", error.methodNotAllowed);

energyRouter.all("/*", error.pageNotFound);

module.exports = energyRouter;
