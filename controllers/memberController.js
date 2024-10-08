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
    return res.status(200).json({ msg: "Success" });
  } catch (err) {
    res.status(403).json({ msg: "Forbidden action" });
    return next(err);
  }
};
