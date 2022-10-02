import log from "loglevel";
log.disableAll();

import db from "../../../db";
import fs from "fs/promises";
import bin from "../../../utils/bin.utils";
import { BinDates } from "../../../types/bin.types";

describe("Starting from absolutely nothing", () => {
  beforeAll(async () => {
    await db.query(`DELETE FROM bin_dates WHERE collection_date >= '1970-01-01'`);
    try {
      await fs.rm("../../../cache");
    } catch {
      return;
    }
  });
  afterAll(async () => {
    await db.end();
  });

  test("Will always return something", async () => {
    const expected: BinDates = {
      BlackDate: "Loading...",
      BlackDay: "",
      GreenDate: "Loading...",
      GreenDay: "",
    };

    const output = await bin.getBinDates();
    // Need to kill the writer stream in Network utils because file download
    // will have started
    expect(expected).toEqual(output);
  });
});

/*
    - Will return latest dates that are already in database
    - When database is out of date, will grab a new file
*/
