const user = require("../routers/userRouter");
const request = require("supertest");
const express = require("express");
const client = require("../prisma/client");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", user);

beforeAll(async () => {
  await client.users.create({
    data: {
      username: "foo",
      email: "bar@baz.com",
      pw: "password",
    },
  });
});

afterAll(async () => {
  await client.users.deleteMany({});
});

describe("Sign Up route", () => {
  describe("Bad input", () => {
    it("Returns 400 if username is longer than 20 characters", (done) => {
      request(app)
        .post("/")
        .type("form")
        .send({
          username: "A_Very_Long_Username_That_Cannot_Be_Used",
          email: "a@b.com",
          pw: "password",
          confirmPw: "password",
        })
        .expect(400, done);
    });

    it("Returns 400 if username is already in the database", (done) => {
      request(app)
        .post("/")
        .type("form")
        .send({
          username: "foo",
          email: "a@b.com",
          pw: "password",
          confirmPw: "password",
        })
        .expect(400, done);
    });

    it("Returns 400 if email is invalid", (done) => {
      request(app)
        .post("/")
        .type("form")
        .send({
          username: "bar",
          email: "not_an_email",
          pw: "password",
          confirmPw: "password",
        })
        .expect(400, done);
    });

    it("Returns 400 if email is already in the database", (done) => {
      request(app)
        .post("/")
        .type("form")
        .send({
          username: "bar",
          email: "bar@baz.com",
          pw: "password",
          confirmPw: "password",
        })
        .expect(400, done);
    });

    it("Returns 400 if passwords do not match", (done) => {
      request(app)
        .post("/")
        .type("form")
        .send({
          username: "bar",
          email: "a@b.com",
          pw: "match",
          confirmPw: "no_match",
        })
        .expect(400, done);
    });

    it("Should send 400 if users do not fill all fields", (done) => {
      request(app)
        .post("/")
        .type("form")
        .send({
          username: "",
          email: "",
          pw: "",
          confirmPw: "",
        })
        .expect(400, done);
    });
  });

  it("Sends user a jwt token upon successful sign up", (done) => {
    request(app)
      .post("/")
      .type("form")
      .send({
        username: "bar",
        email: "a@b.com",
        pw: "password",
        confirmPw: "password",
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.token).toBeDefined();
        return done();
      });
  });
});

describe("Log in Route", () => {
  it("Returns 400 if the user submits empty fields", (done) => {
    request(app)
      .post("/auth")
      .type("form")
      .send({ email: "", pw: "" })
      .expect(400, done);
  });
});
