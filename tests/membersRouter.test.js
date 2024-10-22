const memberRouter = require("../routers/membersRouter");
const request = require("supertest");
const express = require("express");
const { getToken, getUser, getBoardData } = require("../utils/getTestData");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", memberRouter);

const io = {
  to: () => ({ emit: () => {} }),
};
app.set("socketio", io);

describe("Joining boards", () => {
  it("Can join public boards", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardB } = await getBoardData();

    const response = await request(app)
      .post(`/${boardB.id}`)
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(200);
  });

  it("Returns 401 if user is not logged in", async () => {
    const { boardA } = await getBoardData();
    const response = await request(app).post(`/${boardA.id}`);

    expect(response.status).toBe(401);
  });

  it("Returns 403 when trying to join an inaccessible board", async () => {
    const user = await getUser();
    const token = getToken(user);

    const response = await request(app)
      .post("/invalidBoard")
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(403);
  });
});

describe("Leaving Boards", () => {
  it("Can leave public boards", async () => {
    const user = await getUser();
    const token = getToken(user);
    const { boardB } = await getBoardData();

    const response = await request(app)
      .delete(`/${boardB.id}`)
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body.board_id).toBe(boardB.id);
  });
});
