const timesheetsRouter = require("express").Router();
const error = require("../controllers/error.controller");
const tc = require("../controllers/timesheets.controller");

timesheetsRouter.get("/", tc.getIndex);
timesheetsRouter.all("/", error.methodNotAllowed);

timesheetsRouter.get("/select", tc.getSelect);
timesheetsRouter.post("/select", tc.postSelect);
timesheetsRouter.all("/select", error.methodNotAllowed);

timesheetsRouter.post("/enter", tc.postEnter);
timesheetsRouter.all("/enter", error.methodNotAllowed);

timesheetsRouter.get("/view", tc.getView);
timesheetsRouter.all("/view", error.methodNotAllowed);

timesheetsRouter.get("/edit", tc.getEdit);
timesheetsRouter.post("/edit", tc.postEdit);
timesheetsRouter.all("/edit", error.methodNotAllowed);

timesheetsRouter.all("/*", error.pageNotFound);

module.exports = timesheetsRouter;
