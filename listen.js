const app = require("./app");

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});
