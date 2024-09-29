const board = require("../routers/boardsRouter");
const request = require("supertest");
const express = require("express");
const client = require("../prisma/client");
const jwt = require("../utils/jwt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", board);

jest.mock("../utils/cloudinary", () => ({
  uploader: {
    upload: (imgPath) => ({ public_id: "cloudinary_p_id" }),
  },
  url: (id) => "boardImg",
}));

let test_user = null;
let token = "";
let boardA = null;
let boardB = null;

beforeAll(async () => {
  test_user = await client.users.findUnique({
    where: {
      email: "bar@baz.com",
    },
  });

  token = jwt.sign_jwt(test_user);
  boardA = await client.boards.findFirst({
    where: {
      name: "one",
    },
  });
  boardB = await client.boards.findFirst({
    where: {
      name: "two",
    },
  });
});

describe("Board route", () => {
  it("Returns all boards sorted by name", (done) => {
    request(app)
      .get("/")
      .auth(token, { type: "bearer" })
      .expect(
        [
          { ...boardA, members: [{ id: test_user.id }] },
          { ...boardB, members: [] },
        ],
        done
      );
  });

  it("Returns only boards that user is a member of. Name sorted", (done) => {
    request(app)
      .get("/isMember")
      .auth(token, { type: "bearer" })
      .expect(
        [{ id: boardA.id, name: boardA.name, imgurl: boardA.imgurl }],
        done
      );
  });

  it("Creates a new board using userData", (done) => {
    const boardName = "three";
    request(app)
      .post("/")
      .auth(token, { type: "bearer" })
      .attach("boardImg", "./public/images/notFound.png")
      .field("name", boardName)
      .end(async (err, res) => {
        if (err) return done(err);
        const newBoard = await client.boards.findFirst({
          where: {
            name: "three",
          },
        });
        expect(newBoard).toHaveProperty("name", "three");
        expect(newBoard).toHaveProperty("imgurl", "boardImg");
        expect(newBoard).toHaveProperty("img_id", "cloudinary_p_id");
        return done();
      });
  });
});
