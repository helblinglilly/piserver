const app = require("./app");
const seed = require("./db/seed");

const environment = process.env.NODE_ENV || "development";

if (environment == "production") {
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
