const board = require("../routers/boardsRouter");
const request = require("supertest");
const express = require("express");
const client = require("../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", board);

let test_user = null;
let token = "";
let boardA = null;
let boardB = null;

beforeAll(async () => {
  const user = await client.users.create({
    data: {
      username: "foo",
      email: "bar@baz.com",
      pw: await bcrypt.hash("password", 10),
    },
  });

  const userTwo = await client.users.create({
    data: {
      username: "bar",
      email: "foo@bar.com",
      pw: await bcrypt.hash("password", 10),
    },
  });

  test_user = user;

  const [boardOne, boardTwo] = await Promise.all([
    client.boards.create({
      data: {
        name: "one",
        creator_id: user.id,
        members: {
          connect: user,
        },
      },
    }),
    client.boards.create({
      data: {
        name: "two",
        creator_id: userTwo.id,
        members: {
          connect: userTwo,
        },
      },
    }),
  ]);
  boardA = boardOne;
  boardB = boardTwo;

  test_user = user;
  token = jwt.sign_jwt(user);
});

afterAll(async () => {
  await Promise.all([
    client.users.deleteMany({}),
    client.boards.deleteMany({}),
  ]);
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
});
