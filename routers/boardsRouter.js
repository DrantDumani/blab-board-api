const router = require("express").Router();
const passport = require("../passport/passportConfig");
const boardController = require("../controllers/boardController");

router.use(passport.authenticate("jwt", { session: false }));

router.get("/", boardController.getAllBoards);

router.get("/isMember", boardController.getUserBoards);

module.exports = router;
