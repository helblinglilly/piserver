const energyRouter = require("express").Router();
import error from "../controllers/error.controller";
import ec from "../controllers/energy.controller";
import userSelection from "../middleware/user.middleware";

energyRouter.get("/", userSelection, ec.getRoot);

energyRouter.get("/bills", userSelection, ec.getBills);
energyRouter.all("/bills", error.methodNotAllowed);

energyRouter.get("/insert_bill", userSelection, ec.getInsert);
energyRouter.post("/insert_bill", userSelection, ec.postInsert);
energyRouter.all("/insert_bill", error.methodNotAllowed);

energyRouter.get("/view_monthly", userSelection, ec.getViewMonthly);
energyRouter.all("/view_monthly", error.methodNotAllowed);

energyRouter.get("/view_hourly", userSelection, ec.getHourlyUsage);
energyRouter.all("/view_hourly", error.methodNotAllowed);

energyRouter.all("/*", error.pageNotFound);

export default energyRouter;
