const client = require("../prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("../utils/jwt");

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
  // This requires me to configure passport strategies
  // yes...logging in uses passport local
};
