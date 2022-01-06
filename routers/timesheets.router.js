const timesheetsRouter = require("express").Router();
const error = require("../controllers/error.controller");
const tc = require("../controllers/timesheets.controller");

timesheetsRouter.get("/", tc.getTimesheets);
timesheetsRouter.all("/", error.methodNotAllowed);

timesheetsRouter.post("/enter", tc.enter);
timesheetsRouter.all("/enter", error.methodNotAllowed);

timesheetsRouter.get("/view", tc.view);
timesheetsRouter.all("/view", error.methodNotAllowed);

timesheetsRouter.get("/edit", tc.edit);
timesheetsRouter.all("/edit", error.methodNotAllowed);

module.exports = timesheetsRouter;
