const client = require("../prisma/client");
const cloudinary = require("../utils/cloudinary");

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
        created_at: "desc",
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

exports.createBoard = async (req, res, next) => {
  try {
    const boardInfo = {
      name: req.body.name,
    };

    if (req.file) {
      const { transformUrl, public_id } = await cloudinary.handleUpload();
      boardInfo.imgurl = transformUrl;
      boardInfo.img_id = public_id;
    }
    const newBoard = await client.boards.create({
      data: {
        ...boardInfo,
        creator_id: req.user.id,
        members: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });
    return res.json({ newBoard_id: newBoard.id });
  } catch (err) {
    return next(err);
  }
};

exports.getBoardInfo = async (req, res, next) => {
  try {
    const board = await client.boards.findUnique({
      where: {
        id: Number(req.params.boardId),
      },
      omit: {
        type: true,
        created_at: true,
      },
      include: {
        posts: true,
        members: {
          select: {
            id: true,
            username: true,
            pfp: true,
          },
          orderBy: {
            username: "asc",
          },
        },
      },
    });
    return res.json(board);
  } catch (err) {
    res.status(404).json({ msg: "Board not found" });
    return next(err);
  }
};

exports.newBoardMember = async (req, res, next) => {
  try {
    const board_joined = await client.boards.update({
      where: {
        id: Number(req.params.boardId),
      },
      data: {
        members: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });
    return res.json({ board_id: board_joined.id });
  } catch (err) {
    // May fail because the board has been deleted, or does not exist.
    // Will also catch errors where users make up invalid board ids
    res.status(404).json({ msg: "Could not find board" });
    return next(err);
  }
};
