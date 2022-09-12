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
      if (process.env.DEBUGGER === "VSCODE") {
        process.env.ROOTDIR = __dirname + "/..";
      }
      global.port = 9090;
      global.host = "127.0.0.1";
    }
    await seed.seed();
    app.listen(global.port, "0.0.0.0", () => {
      console.log(`Listening on http://127.0.0.1:${global.port}`);
    });
  })
  .catch((err) => {
    console.log("Failed to initialise DB");
    console.log(err);
  });
