import error from "../controllers/error.controller";
import tc from "../controllers/timesheets.controller";
import userSelection from "../middleware/user.middleware";

const timesheetRouter = require("express").Router();

timesheetRouter.get("/", userSelection, tc.getIndex);
timesheetRouter.all("/", error.methodNotAllowed);

timesheetRouter.post("/enter", userSelection, tc.postEnter);
timesheetRouter.all("/enter", error.methodNotAllowed);

timesheetRouter.get("/view", userSelection, tc.getView);
timesheetRouter.all("/view", error.methodNotAllowed);

timesheetRouter.get("/edit", userSelection, tc.getEdit);
timesheetRouter.post("/edit", userSelection, tc.postEdit);
timesheetRouter.all("/edit", error.methodNotAllowed);

module.exports = timesheetRouter;
