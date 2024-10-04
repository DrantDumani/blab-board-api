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
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const uploadedImg = await cloudinary.uploader.upload(dataURI);
      const { public_id } = uploadedImg;
      const transformUrl = cloudinary.url(public_id, {
        width: 128,
        height: 128,
      });
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
