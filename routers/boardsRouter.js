const router = require("express").Router();
const passport = require("../passport/passportConfig");
const boardController = require("../controllers/boardController");
const validators = require("../middleware/validators");
const upload = require("../multer/multerConfig");

router.use(passport.authenticate("jwt", { session: false }));

router.get("/", boardController.getAllBoards);

router.post(
  "/",
  upload.single("boardImg"),
  validators.boardValidationRules(),
  validators.validateFields,
  boardController.createBoard
);

router.get("/isMember", boardController.getUserBoards);

router.get("/:boardId", boardController.getBoardInfo);

router.put(
  "/:boardId",
  upload.single("boardImg"),
  validators.boardValidationRules(),
  validators.validateFields,
  boardController.editBoard
);

router.delete("/:boardId", boardController.deleteBoard);

module.exports = router;
