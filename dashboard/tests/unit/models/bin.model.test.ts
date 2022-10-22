import { expect, test } from "@jest/globals";
import { BinModelDateEntry } from "../../../types/bin.types";
import db from "../../../db";
import model from "../../../models/bin.model";

beforeAll(async () => {
  await db.query("DELETE FROM bin_dates WHERE collection_date >='1970-01-01'");
});

afterAll(async () => {
  await db.query("DELETE FROM bin_dates WHERE collection_date >='1970-01-01'");
  db.end();
});

test("Can insert and retrieve an entry", async () => {
  const inputEntry: BinModelDateEntry = {
    type: "BLACK",
    date: new Date("2020-01-01"),
  };

  await model.insertBinCollectionDate(inputEntry);
  const output = await model.selectBinCollectionDatesByDate(new Date("2020-01-01"));

  expect(output).toEqual([inputEntry]);
});
