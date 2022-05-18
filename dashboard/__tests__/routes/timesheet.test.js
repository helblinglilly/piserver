const request = require("supertest");
const app = require("../../app");
const dbInit = require("../../db/initialConnection");
const db = require("../../db");
const seed = require("../../db/seed");

describe("Timesheet Tests", () => {
  let server;

  beforeEach(async () => {
    await dbInit.initialise();
    await seed.seed();
  });

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
    test.skip("GET - IP Provided - Main page", () => {
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

  describe.skip("/timesheet/enter", () => {
    test("GET - 405", () => {
      return request(app).get("/timesheet/enter").expect(405);
    });

    test("PATCH - 405", () => {
      return request(app).patch("/timesheet/enter").expect(405);
    });

    test("POST - 400 Body does not contain an action", () => {
      return request(app)
        .post("/timesheet/enter")
        .expect(400)
        .then((body) => {
          expect(body.text.includes("Empty payload")).toBe(true);
        });
    });

    test("POST - 400 Break In before Clock In", () => {
      return request(app)
        .post("/timesheet/enter")
        .send({ action: "Break In" })
        .expect(400)
        .then((body) => {
          expect(body.text.includes("Can't 'Break In' yet")).toBe(true);
        });
    });

    test("POST - 400 Break End before Clock In", () => {
      return request(app)
        .post("/timesheet/enter")
        .send({ action: "Break End" })
        .expect(400)
        .then((body) => {
          expect(body.text.includes("Can't 'Break End' yet")).toBe(true);
        });
    });

    test("POST - 400 Clock Out before Clock In", () => {
      return request(app)
        .post("/timesheet/enter")
        .send({ action: "Clock Out" })
        .expect(400)
        .then((body) => {
          expect(body.text.includes("Can't 'Clock Out' yet")).toBe(true);
        });
    });

    test("POST - 200 Clock In successful", () => {
      return request(app)
        .post("/timesheet/enter")
        .send({ action: "Clock In" })
        .expect(200);
    });

    test("POST - 400 Clock In -> Break End fails", () => {
      return request(app)
        .post("/timesheet/enter")
        .send({ action: "Clock In" })
        .expect(200)
        .then((body) => {
          expect(body.text.includes("Found. Redirecting to /timesheet")).toBe(true);
          return request(app)
            .post("/timesheet/enter")
            .send({ action: "Break End" })
            .expect(400)
            .then((body) => {
              expect(body.text.includes("Can't 'Break End' before 'Break In'")).toBe(
                true,
              );
            });
        });
    });

    test("PUT - 405", () => {
      return request(app).put("/timesheet/enter").expect(405);
    });
    test("DELETE - 405", () => {
      return request(app).delete("/timesheet/enter").expect(405);
    });
  });

  describe("/timesheet/view", () => {
    test("GET - 200", () => {
      return request(app).get("/timesheet/view").send().expect(200);
    });
    test("PATCH - 405", () => {
      return request(app).patch("/timesheet/view").expect(405);
    });
    test("POST - 405", () => {
      return request(app).post("/timesheet/view").expect(405);
    });
    test("PUT - 405", () => {
      return request(app).put("/timesheet/view").expect(405);
    });
    test("DELETE - 405", () => {
      return request(app).delete("/timesheet/view").expect(405);
    });
  });
});
