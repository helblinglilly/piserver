const router = require("express").Router();
const error = require("../controllers/error.controller");
const timesheet = require("../controllers/timesheets.controller");

router.get("/timesheet", timesheet.apiGetRoot);

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
module.exports = router;
