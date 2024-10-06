const client = require("../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");
// const passport = require("../passport/passportConfig");
const cloudinary = require("../utils/cloudinary");

exports.signUp = async (req, res, next) => {
  try {
    const hashPw = await bcrypt.hash(req.body.pw, 10);
    const user = await client.users.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        pw: hashPw,
      },
    });

    if (user) {
      const token = jwt.sign_jwt(user);
      return res.json({ token });
    } else throw new Error("Error creating token");
  } catch (err) {
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ err: "An account with that username / email already exists." });
    } else return res.status(500).json({ err: "Internal Server Error" });
  }
};

exports.logIn = async (req, res, next) => {
  try {
    const token = jwt.sign_jwt(req.user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const user = await client.users.findUnique({
      where: {
        id: Number(req.params.userId),
      },
      select: {
        id: true,
        username: true,
        about: true,
        pfp: true,
      },
    });

    if (!user) throw new Error("Not Found");

    return res.json(user);
  } catch (err) {
    if (err === "Not Found") {
      return res.status(404).json({ err: "User not found" });
    }
    return next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const userInfo = {
      about: req.body.about,
    };

    if (req.file) {
      const { transformUrl, public_id } = await cloudinary.handleUpload();
      userInfo.pfp = transformUrl;
      userInfo.pfp_id = public_id;
    }

    const updatedUser = await client.users.update({
      where: {
        id: Number(req.user.id),
      },
      data: userInfo,
      select: {
        id: true,
        username: true,
        about: true,
        pfp: true,
      },
    });

    return res.json(updatedUser);
  } catch (err) {
    console.log(err);
    if (err.code === "P2025") {
      return res.status(404).json({ err: "User not found" });
    } else return next(err);
  }
};
