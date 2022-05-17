const app = require("./app");
const seed = require("./db/seed");
const dbInit = require("./db/initialConnection");
const env = require("./environment");

const environment = env;

dbInit
  .initialise()
  .then(() => {
    console.log(`Initialised for ${environment}`);
    if (environment === "production") {
      global.port = 8080;
      global.host = "127.0.0.1";
    } else {
      global.port = 9090;
      global.host = "127.0.0.1";
    }
    seed.seed();
    app.listen(port, "0.0.0.0", () => {
      console.log(`Listening on http://${host}:${port}`);
    });
  })
  .catch((err) => {
    console.log("Failed to initialise DB");
    console.log(err);
  });
