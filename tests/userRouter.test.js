const user = require("../routers/userRouter");
const request = require("supertest");
const express = require("express");
const client = require("../prisma/client");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", user);

let test_user = null;
let token = "";

beforeAll(async () => {
  const user = await client.users.create({
    data: {
      username: "foo",
      email: "bar@baz.com",
      pw: await bcrypt.hash("password", 10),
    },
  });
  test_user = user;

  request(app)
    .post("/auth")
    .type("form")
    .send({ email: "bar@baz.com", pw: "password" })
    .end((err, res) => {
      if (err) return done(err);
      token = res.body.token;
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

  it("Sends 401 Forbidden if user submits incorrect fields", (done) => {
    request(app)
      .post("/auth")
      .type("form")
      .send({ email: "not@good.com", pw: "wrong" })
      .expect(401, done);
  });

  it("Sends user token on successful login", (done) => {
    request(app)
      .post("/auth")
      .type("form")
      .send({ email: "bar@baz.com", pw: "password" })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.token).toBeDefined();
        return done();
      });
  });
});

describe("Get user info", () => {
  it("Returns 401 if user is not logged in", (done) => {
    request(app).get(`/${test_user.id}`).expect(401, done);
  });

  it("Returns user info if authorized", (done) => {
    request(app)
      .get(`/${test_user.id}`)
      .auth(token, { type: "bearer" })
      .expect({
        id: test_user.id,
        username: test_user.username,
        pfp: test_user.pfp,
        about: test_user.about,
      })
      .expect(200, done);
  });
});

describe("Update user info", () => {
  it("Returns 401 if user is not logged in", (done) => {
    request(app)
      .put("/")
      .attach("pfp", "")
      .field("about", "Lorem Ipsum dolor")
      .expect(401, done);
  });

  it("Sends 400 if about exceeds 200 characters", (done) => {
    const aboutStr = "x".repeat(201);
    request(app)
      .put("/")
      .auth(token, { type: "bearer" })
      .attach("pfp", "")
      .field("about", aboutStr)
      .expect(400, done);
  });

  it("Should update user's about field'", (done) => {
    const aboutStr = "Lorem Ipsum dolor";
    const buffer = Buffer.alloc(1024 * 1024, "image.png");
    request(app)
      .put("/")
      .auth(token, { type: "bearer" })
      .attach("pfp", buffer)
      .field("about", aboutStr)
      .then(() => {
        request(app)
          .get(`/${test_user.id}`)
          .auth(token, { type: "bearer" })
          .expect(
            {
              about: aboutStr,
              id: test_user.id,
              username: test_user.username,
              pfp: test_user.pfp,
            },
            done
          );
      });
  });
});
