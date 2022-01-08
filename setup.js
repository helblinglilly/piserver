const app = require("./app");

const environment = process.env.NODE_ENV || "development";

if (environment == "production") {
  global.port = 8080;
  global.host = "raspberry.pi";
} else {
  global.port = 9090;
  global.host = "127.0.0.1";
}

app.listen(port, () => {
  console.log(`Listening on http://${host}:${port}`);
});
