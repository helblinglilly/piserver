const request = require("supertest");
const app = require("../../app");
const db = require("../../db/");
const seed = require("../../db/seed");

beforeAll(async () => {
  await seed.seed();
});
afterAll(() => {
  if (db.end) db.end();
});

describe("/", () => {
  test.skip("root", () => {
    return request(app).get("/").expect(200);
  });

  describe("/stopwatch", () => {
    test("/", () => {
      return request(app).get("/stopwatch").expect(200);
    });
    test("/view", () => {
      return request(app).get("/stopwatch/view").expect(200);
    });
  });

  describe("/timesheet", () => {
    test("/", () => {
      return request(app).get("/timesheet").expect(200);
    });
    test("/view", () => {
      return request(app).get("/timesheet/view").expect(200);
    });
    test("/edit", () => {
      return request(app).get("/timesheet/edit").expect(200);
    });
  });

  describe("/pokemon", () => {
    test("/", () => {
      return request(app).get("/pokemon").expect(200);
    });
    test("/blackwhite", () => {
      return request(app).get("/pokemon/blackwhite").expect(200);
    });
    test("/search?search=ball", () => {
      return request(app).get("/pokemon/search?search=ballch").expect(200);
    });
    test("/pkmn/1", () => {
      return request(app).get("/pokemon/pkmn/1").expect(200);
    });
    test("/item/1", () => {
      return request(app).get("/pokemon/item/1").expect(200);
    });
  });

  describe("/energy", () => {
    test("root", () => {
      return request(app).get("/energy").expect(200);
    });
    test("/bill", () => {
      return request(app).get("/energy/bills").expect(200);
    });
    test("/insert_electric", () => {
      return request(app).get("/energy/insert_electric").expect(200);
    });
    test("/insert_gas", () => {
      return request(app).get("/energy/insert_gas").expect(200);
    });
    test("/view_monthly", () => {
      return request(app).get("/energy/view_monthly").expect(200);
    });
    test("/view_hourly", () => {
      return request(app).get("/energy/view_hourly").expect(200);
    });
  });
});
