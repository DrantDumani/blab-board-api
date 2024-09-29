const router = require("express").Router();
const passport = require("../passport/passportConfig");
const boardController = require("../controllers/boardController");
const upload = require("../multer/multerConfig");

router.use(passport.authenticate("jwt", { session: false }));

router.get("/", boardController.getAllBoards);

router.post("/", upload.single("boardImg"), boardController.createBoard);

router.get("/isMember", boardController.getUserBoards);

module.exports = router;
