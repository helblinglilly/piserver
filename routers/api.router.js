const apiRouter = require("express").Router();
const apiController = require("../controllers/api.controller");

apiRouter.route("/").get(apiController.getRoot);

module.exports = apiRouter;
