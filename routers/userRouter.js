const router = require("express").Router();
const validators = require("../middleware/validators");
const userController = require("../controllers/userController");
const passport = require("../passport/passportConfig");
const upload = require("../multer/multerConfig");

router.post(
  "/",
  validators.singUpValidationRules(),
  validators.validateFields,
  userController.signUp
);

router.post(
  "/auth",
  validators.loginValidationRules(),
  validators.validateFields,
  passport.authenticate("local", { session: false }),
  userController.logIn
);

router.get(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  userController.getUserInfo
);

// edits user info
// must be logged in AND must be the user who is being edited
// controller throws 403 error if you try to edit another user
router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  upload.single("pfp"),
  validators.updateUserValidationRules(),
  validators.validateFields,
  userController.updateUser
);

module.exports = router;
