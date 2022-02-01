const express = require("express");
const request = require("supertest");
const app = require("../../app");
const seed = require("../../db/seed");
const userModel = require("../../models/user.model");

describe("Timesheet Tests", () => {
  // beforeAll(async () => {
  //     await seed.seed();
  // });

  describe("/timesheet", () => {
    test("GET - 200", async () => {
      return request(app).get("/timesheet").expect(200);
    });
    test("GET - No IP Provided - User selection", async () => {
      return request(app)
        .get("/timesheet")
        .set("X-Forwarded-For", "192.168.2.1")
        .send()
        .expect(200)
        .then(({ text }) => {
          expect(text.includes(`action="/user/select"`)).toBe(true);
        });
    });
    test("GET - IP Provided - Main page", async () => {
      return request(app)
        .get("/timesheet")
        .send()
        .expect(200)
        .then(({ text }) => {
          expect(text.includes(`action="/user/select"`)).toBe(false);
        });
    });
    test("PATCH - 405", () => {
      return request(app).patch("/timesheet").expect(405);
    });
    test("POST - 405", () => {
      return request(app).post("/timesheet").expect(405);
    });
    test("PUT - 405", () => {
      return request(app).put("/timesheet").expect(405);
    });
    test("DELETE - 405", () => {
      return request(app).delete("/timesheet").expect(405);
    });
  });
});
