const app = require("./app");
const seed = require("./db/seed");
const dbInit = require("./db/initialConnection");
const env = require("./environment");

dbInit
  .initialise()
  .then(async () => {
    console.log(`Initialised for ${env}`);
    if (env === "production") {
      global.port = 8080;
      global.host = "127.0.0.1";
    } else {
      global.port = 9090;
      global.host = "127.0.0.1";
    }
    await seed.seed();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Listening on http://${host}:${port}`);
    });
  })
  .catch((err) => {
    console.log("Failed to initialise DB");
    console.log(err);
  });
