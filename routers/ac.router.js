const acRouter = require("express").Router();
const acController = require("../controllers/ac.controller");

acRouter.get("/", acController.getRoot);

module.exports = acRouter;
