const jwt = require("jsonwebtoken");

exports.sign_jwt = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    pfp: user.pfp,
    pfp_id: user.pfp_id,
    about: user.about,
  };

  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "2 days" });
  return token;
};
