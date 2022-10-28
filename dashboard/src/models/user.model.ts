import { getLogger } from "loglevel";
import db from "../db";
import format from "pg-format";

const log = getLogger("user-model");

class UserModel {
  static selectUser = async (ip: string) => {
    return await await db
      .query(format(`SELECT username FROM usertable WHERE ip LIKE %L`, ip))
      .then((result) => {
        if (result.rows.length === 0) return null;
        else return result.rows[0].username;
      })
      .catch((err) => {
        log.error(`selectUser failed with error ${err}`);
        log.trace();
      });
  };

  static insertUser = async (ip: string, username: string) => {
    return await db
      .query(format(`INSERT INTO usertable (ip, username) VALUES (%L, %L)`, ip, username))
      .catch((err) => {
        log.error(
          `Failed to insert ${username} into DB with IP ${ip} which raised error ${err}`,
        );
      });
  };
}

export default UserModel;
