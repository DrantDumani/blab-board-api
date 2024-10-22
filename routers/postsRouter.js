const router = require("express").Router();
const passport = require("../passport/passportConfig");
const postController = require("../controllers/postController");
const upload = require("../multer/multerConfig");
const validators = require("../middleware/validators");

router.use(passport.authenticate("jwt", { session: false }));

router.get("/:boardId", postController.getPosts);

router.post(
  "/:boardId",
  validators.postValidationRules(),
  validators.validateFields,
  postController.newPost
);

router.post(
  "/image/:boardId",
  upload.single("postImg"),
  postController.newImagePost
);

router.put(
  "/:postId",
  validators.postValidationRules(),
  validators.validateFields,
  postController.editPost
);

router.delete("/:postId", postController.deletePost);

module.exports = router;
