const stopwatchRouter = require("express").Router();
import error from "../controllers/error.controller";
import controller from "../controllers/stopwatch.controller";
import userSelection from "../middleware/user.middleware";

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

export default stopwatchRouter;
