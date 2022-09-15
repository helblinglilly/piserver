import app from "./app";
import seed from "./db/seed";
import dbInit from "./db/initialConnection";
import env from "./environment";
import log from "loglevel";

dbInit
  .initialise()
  .then(async () => {
    console.log(`Initialised for ${env}`);
    if (env === "production") {
      global.port = 8080;
      global.host = "127.0.0.1";
      log.setLevel("ERROR");
    } else {
      global.port = 9090;
      global.host = "127.0.0.1";
      log.setLevel("DEBUG");
    }
    await seed.seed();
    app.listen(global.port, "0.0.0.0", () => {
      console.log(`Listening on http://127.0.0.1:${global.port}`);
    });
  })
  .catch((err) => {
    log.error(`Failed to initialise database\n${err}`);
  });
