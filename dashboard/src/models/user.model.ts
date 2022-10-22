import log from "loglevel";
import db from "../db";
import format from "pg-format";

const logger = log.getLogger("user-model");

class UserModel {
  static selectUser = async (ip: string) => {
    const result = await db.query(
      format(`SELECT username FROM usertable WHERE ip LIKE %L`, ip),
    );
    if (result.rows.length === 0) return null;
    else return result.rows[0].username;
  };

  static insertUser = async (ip: string, username: string) => {
    return db
      .query(format(`INSERT INTO usertable (ip, username) VALUES (%L, %L)`, ip, username))
      .catch((err) => {
        logger.error(
          `Failed to insert ${username} into DB with IP ${ip} which raised error ${err}`,
        );
      });
  };
}

export default UserModel;
