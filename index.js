const { Pool } = require("pg");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: `${__dirname}/.env.${ENV}`,
});

module.exports = new Pool({ min: 1, max: 1 });

/*
const app = require("express")();
const http = require("http").Server(app);
const port = process.env.PORT || 3000;



http.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://192.168.0.18:${port}`);
});
*/
