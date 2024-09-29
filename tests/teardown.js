const client = require("../prisma/client");

// purge test database of data
module.exports = async () => {
  await client.boards.deleteMany({});
  await client.users.deleteMany({});
};
