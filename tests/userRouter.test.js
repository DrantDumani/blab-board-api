const user = require("../routers/userRouter");
const request = require("supertest");
const express = require("express");
const { getToken, getUser } = require("../utils/getTestData");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", user);

const mockCloudId = "cloudinary_p_id";
const imgurl = "userImg";
jest.mock("../utils/cloudinary", () => ({
  handleUpload: (fileValue) => ({
    transformUrl: imgurl,
    public_id: mockCloudId,
  }),
}));

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
        username: "baz",
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

describe("Read and update user info", () => {
  it("Returns 401 if user is not logged in", (done) => {
    request(app).get("/1").expect(401, done);
  });

  it("Can read and update user info", async () => {
    const user = await getUser();
    const token = getToken(user);

    const readResp = await request(app)
      .get(`/${user.id}`)
      .auth(token, { type: "bearer" });

    expect(readResp.body.username).toBe(user.username);
    expect(readResp.body.about).toBe(user.about);
    expect(readResp.body.pfp).toBe(user.pfp);

    const aboutStr = "Lorem Ipsum";
    const updateResp = await request(app)
      .put("/")
      .auth(token, { type: "bearer" })
      .attach("pfp", "./public/images/notFound.png")
      .field("about", aboutStr);

    expect(updateResp.status).toBe(200);

    const nextResp = await request(app)
      .get(`/${user.id}`)
      .auth(token, { type: "bearer" });

    expect(nextResp.body.about).toBe(aboutStr);
    expect(nextResp.body.pfp).toBe(imgurl);
  });

  it("Sends 400 if about exceeds 200 characters", (done) => {
    const aboutStr = "x".repeat(201);
    getUser().then((user) => {
      const token = getToken(user);
      request(app)
        .put("/")
        .auth(token, { type: "bearer" })
        .attach("pfp", "")
        .field("about", aboutStr)
        .expect(400, done);
    });
  });
});
