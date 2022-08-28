const fs = require("fs");
const env = require("../environment");

exports.temperature = async (req, res, next) => {
  if (env !== "production") {
    res.send(env);
    return;
  }
  const temp = fs.readFileSync("/sys/class/thermal/thermal_zone0/temp");
  res.send(temp / 1000);
};
