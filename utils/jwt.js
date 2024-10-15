const jwt = require("jsonwebtoken");

exports.sign_jwt = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
  };

  const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "2 days" });
  return token;
};
