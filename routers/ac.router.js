const acRouter = require("express").Router();
const acController = require("../controllers/ac.controller");

acRouter.get("/", acController.getRoot);
acRouter.get("/fish", acController.getFish);

module.exports = acRouter;
