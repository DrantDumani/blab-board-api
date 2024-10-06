const postRouter = require("../routers/postsRouter");
const request = require("supertest");
const express = require("express");
const client = require("../prisma/client");
const jwt = require("../utils/jwt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", postRouter);

jest.mock("../utils/cloudinary", () => ({
  uploader: {
    upload: (imgPath) => ({ public_id: "cloudinary_p_id" }),
  },
  url: (id) => "postImg",
}));

let test_user = null;
let token = "";
let test_board = null;
let test_post = null;
beforeAll(async () => {
  test_user = await client.users.findUnique({
    where: {
      email: "bar@baz.com",
    },
  });

  token = jwt.sign_jwt(test_user);
  test_board = await client.boards.findFirst({
    where: {
      name: "three",
    },
  });

  const testUser2 = await client.users.findUnique({
    where: {
      email: "foo@bar.com",
    },
  });

  test_post = await client.posts.create({
    data: {
      author_id: testUser2.id,
      text: "stuff",
      board_id: test_board.id,
    },
  });
});

// test that a user can make a post to a board
// returns 400 if post is empty
// returns 400 if post > 500 characters
// test that a user can upload images
// test that a user can delete their own posts
// test that a user can edit text posts
// users cannot edit image posts
// users cannot delete posts that do not belong to them

describe("Post route", () => {
  it.skip("Lets a user post to a board", (done) => {
    request(app)
      .post(`/${test_board.id}`)
      .auth(token, { type: "bearer" })
      .send({ text: "stuff" })
      .expect(200, done);
  });
});
