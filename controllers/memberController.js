const client = require("../prisma/client");

exports.joinBoard = async (req, res, next) => {
  try {
    await client.boards.update({
      where: {
        type: "public",
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
    return res
      .status(200)
      .json({ msg: "Success", board_id: req.params.boardId });
  } catch (err) {
    res.status(403).json({ msg: "Forbidden action" });
    return next(err);
  }
};

exports.leaveBoard = async (req, res, next) => {
  try {
    const boardToLeave = await client.boards.update({
      where: {
        id: Number(req.params.boardId),
        type: "public",
      },
      data: {
        members: {
          disconnect: {
            id: req.user.id,
          },
        },
      },
    });
    res.json({ msg: "Left board", board_id: boardToLeave.id });
  } catch (err) {
    return next(err);
  }
};
