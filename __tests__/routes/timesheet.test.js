const express = require("express");
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const seed = require("../../db/seed");

describe("Timesheet Tests", () => {
  let server, agent;

  beforeEach((done) => {
    server = app.listen(4000, (err) => {
      if (err) return done(err);

      agent = request.agent(server);
      done();
    });
  });

  afterEach((done) => {
    server.close(done);
  });

  afterAll(() => {
    if (db.end) db.end();
  });

  describe("/timesheet", () => {
    test("GET - 200", () => {
      return request(app).get("/timesheet").expect(200);
    });
    test("GET - No IP Provided - User selection", () => {
      return request(app)
        .get("/timesheet")
        .set("X-Forwarded-For", "192.168.2.1")
        .send()
        .expect(200)
        .then(({ text }) => {
          expect(text.includes(`action="/user/select"`)).toBe(true);
        });
    });
    test("GET - IP Provided - Main page", () => {
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

  describe("/timesheet/view", () => {
    test("GET - 200", () => {
      return request(app).get("/timesheet").send().expect(200);
    });
    test("GET - 200", () => {
      return request(app).get("/timesheet/view").send().expect(200);
    });
    test("", () => {
      expect(1).toBe(1);
    });
  });
});
