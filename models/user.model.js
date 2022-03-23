const db = require("../db");
const format = require("pg-format");

const env = process.env.NODE_ENV || "dev";

exports.selectUser = async (ip) => {
  return db
    .query(format(`SELECT username FROM usertable_${env} WHERE ip LIKE %L`, ip))
    .then((result) => {
      if (result.rows.length === 0) return null;
      else return result.rows[0].username;
    });
};

exports.insertUser = async (ip, username) => {
  try {
    return db.query(
      format(`INSERT INTO usertable_${env} (ip, username) VALUES (%L, %L)`, ip, username),
    );
  } catch (err) {
    console.log(err);
  }
};
