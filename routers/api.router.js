const apiRouter = require("express").Router();
const acRouter = require("./ac.router");
const apiController = require("../controllers/api.controller");

apiRouter.route("/").get(apiController.getRoot);
apiRouter.route("/ac", acRouter);
module.exports = apiRouter;
