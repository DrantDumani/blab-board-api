const client = require("../prisma/client");
const jwt = require("../utils/jwt");

exports.getUser = async () => {
  const test_user = await client.users.findUnique({
    where: { email: "bar@baz.com" },
  });
  return test_user;
};

exports.getToken = (user) => {
  const token = jwt.sign_jwt(user);
  return token;
};

exports.getTestUser2 = async () => {
  const test_user2 = await client.users.findUnique({
    where: { email: "foo@bar.com" },
  });
  return test_user2;
};

exports.getBoardData = async () => {
  const boardA = await client.boards.findFirst({
    where: { name: "one" },
  });
  const boardB = await client.boards.findFirst({
    where: { name: "two" },
  });
  const boardC = await client.boards.findFirst({
    where: { name: "three" },
  });
  return { boardA, boardB, boardC };
};
