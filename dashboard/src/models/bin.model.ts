import db from "../db";
import format from "pg-format";
import DateUtils from "../utils/date.utils";
import { QueryResult } from "pg";
import { BinModelDateEntry } from "../types/bin.types";
import GeneralUtils from "../utils/general.utils";

class BinModel {
  static insertBinCollectionDate = async (entry: BinModelDateEntry) => {
    return db.query(
      format(
        `
          INSERT INTO bin_dates 
          (bin_type, collection_date)
          VALUES
          (%L, %L)`,
        entry.type,
        entry.date.toISOString(),
      ),
    );
  };

  static selectBinCollectionDatesByDate = async (
    date: Date,
  ): Promise<Array<BinModelDateEntry>> => {
    return db
      .query(
        format(
          `
        SELECT 
          bin_type AS type, collection_date AS date
        FROM bin_dates
        WHERE collection_date >= %L
        ORDER BY collection_date`,
          date.toISOString(),
        ),
      )
      .then((result: QueryResult<any>) => {
        return result.rows;
      });
  };
}

export default BinModel;
