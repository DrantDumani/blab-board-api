const client = require("../prisma/client");

exports.getAllBoards = async (req, res, next) => {
  try {
    const boards = await client.boards.findMany({
      where: {
        type: "public",
      },
      include: {
        members: {
          where: {
            id: req.user.id,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return res.json(boards);
  } catch (err) {
    return next(err);
  }
};

exports.getUserBoards = async (req, res, next) => {
  try {
    const userBoards = await client.boards.findMany({
      where: {
        members: {
          some: {
            id: req.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        imgurl: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return res.json(userBoards);
  } catch (err) {
    return next(err);
  }
};
