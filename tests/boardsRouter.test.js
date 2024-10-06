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

  // it("Can create, update, and delete boards", async () => {
  //   const user = await getUser();
  //   const token = await getToken(user);
  //   const boardName = "test_board"

  //   const createBoardResp = await request(app)
  //   .post("/")
  //   .auth(token, {type: "bearer"})
  //   .field("name", boardName)

  //   expect(createBoardResp.body).toHaveProperty("newBoard_id")

  //   const updateBoardResp = await request(app)

  // })

  // it("Creates a new board using userData", (done) => {
  //   const boardName = "four";
  //   getToken().then(({ token }) => {
  //     request(app)
  //       .post("/")
  //       .auth(token, { type: "bearer" })
  //       .attach("boardImg", "./public/images/notFound.png")
  //       .field("name", boardName)
  //       .end(async (err, res) => {
  //         if (err) return done(err);
  //         const newBoard = await client.boards.findFirst({
  //           where: {
  //             name: "four",
  //           },
  //         });
  //         expect(newBoard).toHaveProperty("name", "four");
  //         expect(newBoard).toHaveProperty("imgurl", "boardImg");
  //         expect(newBoard).toHaveProperty("img_id", "cloudinary_p_id");
  //         return done();
  //       });
  //   });
  // });

  // it("Gets the board info, board posts, and members", (done) => {
  //   Promise.all([getToken(), getBoardData()]).then((dataArr) => {
  //     const { token, test_user } = dataArr[0];
  //     const { boardA } = dataArr[1];
  //     request(app)
  //       .get(`/${boardA.id}`)
  //       .auth(token, { type: "bearer" })
  //       .expect(
  //         {
  //           id: boardA.id,
  //           name: boardA.name,
  //           imgurl: boardA.imgurl,
  //           img_id: boardA.img_id,
  //           creator_id: boardA.creator_id,
  //           posts: [],
  //           members: [
  //             {
  //               id: test_user.id,
  //               username: test_user.username,
  //               pfp: test_user.pfp,
  //             },
  //           ],
  //         },
  //         done
  //       );
  //   });
  // });
});
