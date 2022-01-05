const app = require("./app");

let port = 9090;
let host = "http://127.0.0.1";

if (process.env.NODE_ENV === "production") {
  port = 8080;
  host = "http://raspberry.pi";
}

app.listen(port, () => {
  console.log(`Listening on ${host}:${port}`);
  console.log(process.env.NODE_ENV);
});

module.exports = Object.freeze({
  host: host,
  port: port,
});
