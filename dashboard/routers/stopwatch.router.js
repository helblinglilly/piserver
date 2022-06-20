const stopwatchRouter = require("express").Router();
const error = require("../controllers/error.controller");
const controller = require("../controllers/stopwatch.controller");
const userSelection = require("../middleware/user.middleware");

stopwatchRouter.get("/", userSelection, controller.getRoot);
stopwatchRouter.all("/", error.methodNotAllowed);

stopwatchRouter.get("/view", userSelection, controller.getView);
stopwatchRouter.all("/view", error.methodNotAllowed);

stopwatchRouter.post("/start", userSelection, controller.start);
stopwatchRouter.all("/start", error.methodNotAllowed);

stopwatchRouter.post("/stop", userSelection, controller.stop);
stopwatchRouter.all("/stop", error.methodNotAllowed);

stopwatchRouter.post("/cont", userSelection, controller.cont);
stopwatchRouter.all("/cont", error.methodNotAllowed);

stopwatchRouter.post("/end", userSelection, controller.end);
stopwatchRouter.all("/end", error.methodNotAllowed);

module.exports = stopwatchRouter;
