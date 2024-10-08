const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^image/)) {
      cb(null, true);
    } else cb(null, false);
  },
});

module.exports = upload;
