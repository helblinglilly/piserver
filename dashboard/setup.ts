import log from "loglevel";
import app from "./app";
import dbInit from "./db/initialConnection";
import env from "./environment";
import Seed from "./db/seed";

dbInit
  .initialise()
  .then(async () => {
    log.info(`Initialised for ${env}`);

    if (env === "production") {
      global.port = 8080;
      global.host = "127.0.0.1";
      log.setLevel("ERROR");

      await Seed.seedForProduction();
    }

    if (env === "test") {
      log.disableAll();
    }

    if (env === "dev") {
      global.port = 9090;
      global.host = "127.0.0.1";

      await Seed.seedForDev();
    }

    app.listen(global.port, "0.0.0.0", () => {
      log.info(`Listening on http://127.0.0.1:${global.port}`);
    });
  })
  .catch((err) => {
    log.error(`Failed to initialise database\n${err}`);
  });
