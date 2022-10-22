import { expect, test } from "@jest/globals";
import db from "../../../db";

import model from "../../../models/user.model";

beforeAll(async () => {
  await db.query("DELETE FROM usertable WHERE ip='192.168.999.999'");
});
afterAll(async () => {
  await db.query("DELETE FROM usertable WHERE ip='192.168.999.999'");
  db.end();
});

test("Can insert and retrieve a user", async () => {
  const inputIP = "192.168.999.999";
  const inputUsername = "test1";

  await model.insertUser(inputIP, inputUsername);
  const output = await model.selectUser(inputIP);

  expect(output).toBe(inputUsername);
});
