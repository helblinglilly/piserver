import log from "loglevel";
import app from "./app";
import env from "./environment";
import DBSetup from "./db/initialConnection";
import Seed from "./db/seed";

require("dotenv").config();

log.info(`Initialising for ${env}...`);

const requiredEnvVars = [
  "POSTGRES_USER",
  "POSTGRES_HOST",
  "POSTGRES_DATABASE",
  "POSTGRES_PASSWORD",
  "OCTOPUS_ACCOUNT_NUMBER",
  "OCTOPUS_API_KEY",
  "OCTOPUS_ELECTRIC_MPAN",
  "OCTOPUS_ELECTRIC_SERIAL",
  "OCTOPUS_GAS_MPRN",
  "OCTOPUS_GAS_SERIAL",
  "MOVE_IN_DATE",
  "ADDRESS_CODE",
  "TZ",
];

requiredEnvVars.forEach((variable) => {
  if (process.env[variable] === undefined) {
    log.error(`Missing environment variable ${variable}! Shutting down...`);
    process.exit(0);
  }
});

DBSetup.initialise()
  .then(async () => {
    log.info("Initialised");

    let port: number = 0;

    if (env === "production") {
      port = 8080;
      log.setLevel("INFO");
      await Seed.seedForProduction();
    }

    if (env === "test") {
      log.disableAll();
    }

    if (env === "dev") {
      port = 9090;
      await Seed.seedForDev();
    }

    try {
      app.listen(port, "0.0.0.0", () => {
        log.info(`Listening on http://127.0.0.1:${port}`);
      });
    } catch (err) {
      log.error(`Completed setup but failed to initialise app with error ${err}`);
    }
  })
  .catch((err) => {
    log.error("Failed to initialised database: ", err);
    process.exit(1);
  });
