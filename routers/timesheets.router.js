const timesheetsRouter = require("express").Router();
const error = require("../controllers/error.controller");
const tc = require("../controllers/timesheets.controller");

timesheetsRouter.get("/", tc.getTimesheets);
timesheetsRouter.all("/", error.methodNotAllowed);

module.exports = timesheetsRouter;
