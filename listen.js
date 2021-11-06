const app = require("./app");

const PORT = 9090;

app.listen(PORT, () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});
