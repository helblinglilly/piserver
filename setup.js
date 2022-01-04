const app = require("./app");

const PORT = process.env.port || 9090;
const HOST = process.env.host || "http://127.0.0.1";

app.listen(PORT, () => {
  console.log(`Listening on ${HOST}:${PORT}`);
});

module.exports = HOST;
