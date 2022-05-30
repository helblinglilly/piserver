const router = require("express").Router();
const error = require("../controllers/error.controller");
const timesheet = require("../controllers/timesheets.controller");
const system = require("../controllers/system.controller");

// router.get("/timesheet", timesheet.apiGetRoot);
// router.all("/timesheet", error.methodNotAllowed);

router.get("/temperature", system.temperature);
router.all("/temperature", error.methodNotAllowed);

router.get("/", (req, res, next) => {
  res.send({
    "/": {
      GET: {
        headers: "None",
        function: "Show this overview",
      },
    },
    "/timesheet": {
      GET: {
        headers: "username - [joel|harry]",
        function: "Return current entries",
      },
    },
  });
});

router.all("/", error.methodNotAllowed);

module.exports = router;
