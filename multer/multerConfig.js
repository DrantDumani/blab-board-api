const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 1024 * 1024, files: 1 },
});

module.exports = upload;
