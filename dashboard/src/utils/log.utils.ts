import log from "loglevel";
import prefix from "loglevel-plugin-prefix";
import chalk from "chalk";

const padWithLeadingCharacters = (
  input: any,
  desiredTotalLength: number,
  character: string,
): string => {
  return String(input).padStart(desiredTotalLength, character);
};

prefix.reg(log);
log.setDefaultLevel("TRACE");

const logColors = {
  ERROR: chalk.red,
  WARN: chalk.yellow,
  INFO: chalk.blue,
  DEBUG: chalk.cyan,
  TRACE: chalk.magenta,
};

prefix.apply(log, {
  timestampFormatter(date) {
    return `${padWithLeadingCharacters(
      date.getMonth() + 1,
      2,
      "0",
    )}-${padWithLeadingCharacters(date.getDate(), 2, "0")} ${date.toLocaleTimeString(
      "en-GB",
    )}.${padWithLeadingCharacters(date.getMilliseconds(), 3, "0")}`;
  },

  format(level, name, timestamp) {
    return `${chalk.grey("[" + timestamp + "]")} ${chalk.green(name)} ${logColors[
      level.toUpperCase()
    ](level)}:`;
  },
});
