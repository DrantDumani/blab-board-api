const router = require("express").Router();
const passport = require("../passport/passportConfig");
const friendController = require("../controllers/friendController");

router.use(passport.authenticate("jwt", { session: false }));

router.get("/", friendController.getAllFriends);

router.post("/:friendId", friendController.sendFriendReq);

router.put("/:userId", friendController.confirmFriendReq);

router.delete("/:friendId", friendController.deleteFriend);

module.exports = router;
