import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import chalk from "chalk";

prefix.reg(log);
log.enableAll();

const logColors = {
  ERROR: chalk.red,
  WARN: chalk.yellow,
  INFO: chalk.blue,
  DEBUG: chalk.cyan,
  TRACE: chalk.magenta,
};

prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.grey("[" + timestamp + "]")} ${chalk.green(name)} ${logColors[
      level.toUpperCase()
    ](level)}:`;
  },
});
