const client = require("../prisma/client");
const cloudinary = require("../utils/cloudinary");

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await client.posts.findMany({
      where: {
        board_id: Number(req.params.boardId),
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    return res.json(posts);
  } catch (err) {
    res.status(404).json({ msg: "Board not found" });
    return next(err);
  }
};

exports.newPost = async (req, res, next) => {
  try {
    const newPost = await client.posts.create({
      data: {
        author_id: req.user.id,
        text: req.body.text,
        board_id: Number(req.params.boardId),
      },
    });
    const post_author_obj = {
      post: newPost,
      author: { username: req.user.username, pfp: req.user.pfp },
    };
    const io = req.app.get("socketio");
    io.to(req.params.boardId).emit("boardMsg", post_author_obj, "create");

    return res.json({ postId: newPost.id });
  } catch (err) {
    res.status(400);
    return next(err);
  }
};

exports.editPost = async (req, res, next) => {
  try {
    const updatedPost = await client.posts.update({
      where: {
        author_id: req.user.id,
        id: Number(req.params.postId),
      },
      data: {
        text: req.body.text,
        is_edited: true,
      },
    });
    const post_author_obj = {
      post: updatedPost,
      author: { username: req.user.username, pfp: req.user.pfp },
    };
    const io = req.app.get("socketio");
    io.to(updatedPost.board_id.toString()).emit(
      "boardMsg",
      post_author_obj,
      "edit"
    );
    return res.json(updatedPost);
  } catch (err) {
    if (err.code === "P2025") {
      res.status(403).json({ msg: "Unable to perform action" });
    }
    return next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const deletedPost = await client.posts.delete({
      where: {
        author_id: req.user.id,
        id: Number(req.params.postId),
      },
    });

    const postObj = { post: deletedPost, author: {} };

    const io = req.app.get("socketio");
    io.to(deletedPost.board_id.toString()).emit("boardMsg", postObj, "delete");

    res.json(deletedPost);
    if (deletedPost.type === "image") {
      await cloudinary.cloudapi.uploader.destroy(deletedPost.c_public_id);
    }
  } catch (err) {
    if (err.code === "P2025") {
      res.status(403).json({ msg: "Unable to perform action" });
    }
    return next(err);
  }
};

exports.newImagePost = async (req, res, next) => {
  try {
    if (req.file) {
      const { url, public_id } = await cloudinary.handleUpload(
        req.file,
        "",
        req.params.boardId
      );
      const newImgPost = await client.posts.create({
        data: {
          author_id: req.user.id,
          board_id: Number(req.params.boardId),
          text: url,
          type: "image",
          c_public_id: public_id,
        },
      });

      const post_author_obj = {
        post: newImgPost,
        author: { username: req.user.username, pfp: req.user.pfp },
      };
      const io = req.app.get("socketio");
      io.to(req.params.boardId).emit("boardMsg", post_author_obj, "create");
      return res.json(newImgPost);
    }
  } catch (err) {
    // the file not being an image, or the image being too big make a bad request
    res.status(400).json({ msg: "Bad Request" });
    return next(err);
  }
};
