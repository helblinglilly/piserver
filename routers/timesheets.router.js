const timesheetsRouter = require("express").Router();
const error = require("../controllers/error.controller");
const tc = require("../controllers/timesheets.controller");
const userSelection = require("../middleware/user.middleware");

timesheetsRouter.get("/", userSelection, tc.getIndex);
timesheetsRouter.all("/", error.methodNotAllowed);

timesheetsRouter.post("/enter", userSelection, tc.postEnter);
timesheetsRouter.all("/enter", error.methodNotAllowed);

timesheetsRouter.get("/view", userSelection, tc.getView);
timesheetsRouter.all("/view", error.methodNotAllowed);

timesheetsRouter.get("/edit", userSelection, tc.getEdit);
timesheetsRouter.post("/edit", userSelection, tc.postEdit);
timesheetsRouter.all("/edit", error.methodNotAllowed);

timesheetsRouter.all("/*", error.pageNotFound);

module.exports = timesheetsRouter;
