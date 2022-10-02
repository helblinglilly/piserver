const db = require("../db");
const format = require("pg-format");

exports.insertBinCollectionDate = async (binType, date) => {
  return db.query(
    format(
      `INSERT INTO bin_dates
        (bin_type, collection_date)
        VALUES
        (%L, %L)`,
      binType,
      date,
    ),
  );
};

exports.selectBinCollectionDatesByDate = async (date) => {
  return db
    .query(
      format(
        `SELECT bin_type, collection_date
            FROM bin_dates
            WHERE collection_date >= %L
            ORDER BY collection_date `,
        date,
      ),
    )
    .then((result) => {
      return result.rows;
    });
};
