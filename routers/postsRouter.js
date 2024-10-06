const router = require("express").Router();
const passport = require("../passport/passportConfig");
const postController = require("../controllers/postController");
const upload = require("../multer/multerConfig");

router.use(passport.authenticate("jwt", { session: false }));

router.post("/:boardId", postController.newPost);

module.exports = router;
