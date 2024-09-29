const client = require("../prisma/client");
const bcrypt = require("bcrypt");

// initialize test database with info
module.exports = async () => {
  const [user, userTwo] = await Promise.all([
    client.users.create({
      data: {
        username: "foo",
        email: "bar@baz.com",
        pw: await bcrypt.hash("password", 10),
      },
    }),
    await client.users.create({
      data: {
        username: "bar",
        email: "foo@bar.com",
        pw: await bcrypt.hash("password", 10),
      },
    }),
  ]);

  await Promise.all([
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
};

// // clean test database
// afterAll(async () => {
//   await client.boards.deleteMany({});
//   await client.users.deleteMany({});
// });
