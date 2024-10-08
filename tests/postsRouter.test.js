const postRouter = require("../routers/postsRouter");
const request = require("supertest");
const express = require("express");
const {
  getToken,
  getTestUser2,
  getUser,
  getBoardData,
} = require("../utils/getTestData");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", postRouter);

const mockCloudId = "cloudinary_p_id";
const imgurl = "boardImg";
jest.mock("../utils/cloudinary", () => ({
  handleUpload: (fileValue) => ({
    transformUrl: imgurl,
    public_id: mockCloudId,
    url: "postImgUrl",
  }),
  cloudapi: {
    uploader: {
      destroy: () => {},
    },
  },
}));

describe("Read posts", () => {
  it("Returns 401 if a user is not logged in", async () => {
    const response = await request(app).get(`/1`);
    expect(response.status).toBe(401);
  });

  it("Returns array of posts on a board", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardC } = await getBoardData();

    const response = await request(app)
      .get(`/${boardC.id}`)
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body.length).toBeDefined();
    expect(response.body[0]).toBeDefined();
  });

  it("Returns 404 if the board id invalid.", async () => {
    const user = await getUser();
    const token = getToken(user);

    const response = await request(app)
      .get("/invalid")
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(404);
  });
});

describe("Create posts", () => {
  it("Allows a user to make text poss to a board", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardC } = await getBoardData();

    const response = await request(app)
      .post(`/${boardC.id}`)
      .auth(token, { type: "bearer" })
      .send({ text: "Void Stranger is the best game of 2023" });

    expect(response.status).toBe(200);
    expect(response.body.postId).toBeDefined();
  });

  it("Returns 400 if board does not exist", async () => {
    const user = await getUser();
    const token = getToken(user);

    const response = await request(app)
      .post("/invalid")
      .auth(token, { type: "bearer" })
      .send({ text: "Void Stranger is the best game of 2023" });

    expect(response.status).toBe(400);
  });

  it("Returns 400 if the text exceeds 500 characters", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardC } = await getBoardData();

    const longPost = "x".repeat(501);
    const response = await request(app)
      .post(`/${boardC.id}`)
      .auth(token, { type: "bearer" })
      .send({ text: longPost });

    expect(response.status).toBe(400);
  });

  it("Returns 400 if the text is empty", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardC } = await getBoardData();

    const response = await request(app)
      .post(`/${boardC.id}`)
      .auth(token, { type: "bearer" })
      .send({ text: "" });

    expect(response.status).toBe(400);
  });

  it("Uploads images", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardC } = await getBoardData();

    const response = await request(app)
      .post(`/image/${boardC.id}`)
      .auth(token, { type: "bearer" })
      .attach("postImg", "./public/images/notFound.png");

    expect(response.status).toBe(200);
    expect(response.body.type).toBe("image");
  });
});

describe("Update posts", () => {
  it("Can update posts", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardC } = await getBoardData();

    const initPost = "Ocarina";
    const updatedPost = "Majora";

    const response = await request(app)
      .post(`/${boardC.id}`)
      .auth(token, { type: "bearer" })
      .send({ text: initPost });

    const { postId } = response.body;

    const updatedResp = await request(app)
      .put(`/${postId}`)
      .auth(token, { type: "bearer" })
      .send({ text: updatedPost });

    expect(updatedResp.body.text).toBe(updatedPost);
    expect(updatedResp.body.is_edited).toBe(true);
  });

  it("Returns 403 when trying to edit a post that a user did not make", async () => {
    const userA = await getUser();
    const tokenA = getToken(userA);

    const userB = await getTestUser2();
    const tokenB = getToken(userB);
    const { boardC } = await getBoardData();

    const postResp = await request(app)
      .post(`/${boardC.id}`)
      .auth(tokenA, { type: "bearer" })
      .send({ text: "Stuff" });

    const { postId } = postResp.body;

    const updatePostResp = await request(app)
      .put(`/${postId}`)
      .auth(tokenB, { type: "bearer" })
      .send({ text: "Does not work" });

    expect(updatePostResp.status).toBe(403);
  });
});

describe("Deleting posts", () => {
  it("Deletes posts", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardC } = await getBoardData();

    const postResp = await request(app)
      .post(`/${boardC.id}`)
      .auth(token, { type: "bearer" })
      .send({ text: "Stuff" });

    const { postId } = postResp.body;

    const deleteResp = await request(app)
      .delete(`/${postId}`)
      .auth(token, { type: "bearer" });

    expect(deleteResp.status).toBe(200);
    expect(deleteResp.body.id).toBe(postId);
  });

  it("Returns 403 when trying to delete an inaccessible post", async () => {
    const userA = await getUser();
    const tokenA = getToken(userA);

    const userB = await getTestUser2();
    const tokenB = getToken(userB);
    const { boardC } = await getBoardData();

    const postResp = await request(app)
      .post(`/${boardC.id}`)
      .auth(tokenA, { type: "bearer" })
      .send({ text: "Stuff" });

    const { postId } = postResp.body;
    const deleteResp = await request(app)
      .delete(`/${postId}`)
      .auth(tokenB, { type: "bearer" });

    expect(deleteResp.status).toBe(403);
  });
});
