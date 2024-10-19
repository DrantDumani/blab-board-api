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
        type: "public",
      },
      select: {
        id: true,
        name: true,
        imgurl: true,
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
      const { transformUrl, public_id } = await cloudinary.handleUpload(
        req.file
      );
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
      include: {
        posts: {
          include: {
            author: {
              select: {
                pfp: true,
                username: true,
              },
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        },
        creator: {
          select: {
            id: true,
          },
        },
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

    if (!board) throw new Error();
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

exports.editBoard = async (req, res, next) => {
  try {
    const updateInfo = {
      name: req.body.name,
    };
    if (req.file && req.body.img_id) {
      const { transformUrl } = await cloudinary.handleUpload(
        req.file,
        req.body.img_id
      );
      updateInfo.imgurl = transformUrl;
    }
    const editedBoard = await client.boards.update({
      where: {
        id: Number(req.params.boardId),
        img_id: req.body.img_id,
      },
      data: updateInfo,
    });
    return res.json({ board_id: editedBoard.id });
  } catch (err) {
    // if there was an error, then delete the uploaded image from cloudinary
    if (req.body.img_id) {
      await cloudinary.cloudapi.uploader.destroy(req.body.img_id);
    }
    return next(err);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    const deletedBoard = await client.boards.delete({
      where: {
        id: Number(req.params.boardId),
        creator_id: req.user.id,
      },
    });
    // if there's an image_id, delete the image from cloudinary
    if (deletedBoard.img_id) {
      await cloudinary.cloudapi.uploader.destroy(deletedPost.img_id);
    }
    // delete all images posted to the board from cloudinary
    if (deletedBoard) {
      await cloudinary.cloudapi.api.delete_resources_by_prefix(
        `${req.params.boardId}/`
      );
    }

    return res.json({ deleted_id: deletedBoard.id });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ msg: "Board not found" });
    }
    return next(err);
  }
};
