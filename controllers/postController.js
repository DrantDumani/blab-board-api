const client = require("../prisma/client");

exports.newPost = async (req, res, next) => {
  try {
    await client.posts.create({
      data: {
        author_id: req.user.id,
        text: req.body.text,
        board_id: Number(req.params.boardId),
      },
    });

    return res.json({ msg: "Success" });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
