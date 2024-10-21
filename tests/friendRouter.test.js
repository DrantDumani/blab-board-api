const friend = require("../routers/friendsRouter");
const request = require("supertest");
const express = require("express");
const { getToken, getUser, getTestUser2 } = require("../utils/getTestData");
const client = require("../prisma/client");

beforeEach(async () => {
  await client.friends.deleteMany({});
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", friend);

describe("Friend route", () => {
  it("Should return an array of friends", async () => {
    const user = await getUser();
    const token = getToken(user);

    const response = await request(app)
      .get("/")
      .auth(token, { type: "bearer" });

    expect(response.status).toBe(200);
    expect(response.body.friends).toBeInstanceOf(Array);
  });

  it("Should send friend request to user", async () => {
    const user = await getUser();
    const token = getToken(user);

    const receiver = await getTestUser2();

    const response = await request(app)
      .post(`/${receiver.id}`)
      .auth(token, { type: "bearer" });

    expect([user.id, receiver.id]).toContain(response.body.friend_id);
    expect(response.body.status).toMatch(/^pending/);
  });

  it("Should accept friend request", async () => {
    const user = await getUser();

    const receiver = await getTestUser2();
    const userToken = getToken(user);
    const receiverToken = getToken(receiver);

    await request(app)
      .post(`/${receiver.id}`)
      .auth(userToken, { type: "bearer" });

    const response = await request(app)
      .put(`/${user.id}`)
      .auth(receiverToken, { type: "bearer" });

    expect([user.id, receiver.id]).toContain(response.body.friend_id);
    expect([user.id, receiver.id]).toContain(response.body.user_id);
    expect(response.body.status).toBe("accepted");
  });

  it("Should delete friendship or friend request", async () => {
    const user = await getUser();

    const receiver = await getTestUser2();
    const userToken = getToken(user);
    const receiverToken = getToken(receiver);

    await request(app)
      .post(`/${receiver.id}`)
      .auth(userToken, { type: "bearer" });

    const response = await request(app)
      .delete(`/${user.id}`)
      .auth(receiverToken, { type: "bearer" });

    expect(response.status).toBe(200);
    expect([user.id, receiver.id]).toContain(response.body.friend_id);
    expect([user.id, receiver.id]).toContain(response.body.user_id);
  });
});
