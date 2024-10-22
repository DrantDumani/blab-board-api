const router = require("express").Router();
const passport = require("../passport/passportConfig");
const memberController = require("../controllers/memberController");

router.use(passport.authenticate("jwt", { session: false }));

router.post("/:boardId", memberController.joinBoard);

router.delete("/:boardId", memberController.leaveBoard);

module.exports = router;
