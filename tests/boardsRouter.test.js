const board = require("../routers/boardsRouter");
const request = require("supertest");
const express = require("express");
const { getToken, getUser, getBoardData } = require("../utils/getTestData");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", board);

const mockCloudId = "cloudinary_p_id";
const imgurl = "boardImg";
jest.mock("../utils/cloudinary", () => ({
  handleUpload: (fileValue) => ({
    transformUrl: imgurl,
    public_id: mockCloudId,
  }),
  cloudapi: {
    api: {
      delete_resources_by_prefix: () => {},
    },
  },
}));

describe("Board route", () => {
  it("Returns 401 if user is logged out", (done) => {
    request(app).get("/").expect(401, done);
  });

  it("Returns array of public boards", async () => {
    const user = await getUser();
    const token = getToken(user);
    const response = await request(app)
      .get("/")
      .auth(token, { type: "bearer" });

    expect(response.body.length).toBeGreaterThan(0);
    expect(response.status).toBe(200);

    response.body.forEach((el) => {
      expect(el.type).toBe("public");
    });
  });

  it("Returns array of boards", async () => {
    const user = await getUser();
    const token = getToken(user);
    const response = await request(app)
      .get("/")
      .auth(token, { type: "bearer" });

    expect(response.body.length).toBeDefined();
    expect(response.status).toBe(200);
  });

  describe("Board creation errors", () => {
    it("Returns 401 and does not create a board", (done) => {
      request(app).post("/").field("name", "Nonya").expect(401, done);
    });

    it("Returns 400 if name is longer than 20 characters", async () => {
      const user = await getUser();
      const token = getToken(user);
      const longName = "x".repeat(201);
      const response = await request(app)
        .post("/")
        .auth(token, { type: "bearer" })
        .field("name", longName);

      expect(response.status).toBe(400);
    });
  });

  it("Returns board info, board members, and board posts", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardA } = await getBoardData();

    const response = await request(app)
      .get(`/${boardA.id}`)
      .auth(token, { type: "bearer" });

    expect(response.body.posts.length).toBeDefined();
    expect(response.body.members.length).toBeDefined();
    expect(response.body.name).toBe(boardA.name);
  });

  describe("Integration tests", () => {
    it("Can create, edit, and delete boards", async () => {
      const user = await getUser();
      const token = getToken(user);

      const createResp = await request(app)
        .post("/")
        .auth(token, { type: "bearer" })
        .field("name", "testBoard");

      // expect a board with createResp's id to have the name "testBoard"
      const board_id = createResp.body.newBoard_id;
      expect(board_id).toBeDefined();

      const getBoard = await request(app)
        .get(`/${board_id}`)
        .auth(token, { type: "bearer" });

      expect(getBoard.body.name).toBe("testBoard");

      // edit the board
      await request(app)
        .put(`/${board_id}`)
        .auth(token, { type: "bearer" })
        .field("name", "New Name");

      const getEditedBoard = await request(app)
        .get(`/${board_id}`)
        .auth(token, { type: "bearer" });

      expect(getEditedBoard.body.name).toBe("New Name");

      // delete the board
      const deleteResp = await request(app)
        .delete(`/${board_id}`)
        .auth(token, { type: "bearer" });
      expect(deleteResp.status).toBe(200);
      expect(deleteResp.body.deleted_id).toBe(board_id);

      const lastResponse = await request(app)
        .get(`/${board_id}`)
        .auth(token, { type: "bearer" });

      expect(lastResponse.status).toBe(404);
    });
  });
});
