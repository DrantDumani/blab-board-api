const router = require("express").Router();
const validators = require("../middleware/validators");
const userController = require("../controllers/userController");

// the sign up route. Adds a new user to the database
// cannot be used if the user is already logged in
// sends a 400 bad request if the data does not pass validation
// sends a 400 code and a different error if db detects duplicate data
// signs the user in upon successful sign up.
router.post(
  "/",
  validators.singUpValidationRules(),
  validators.validateSignUp,
  userController.signUp
);

// the login route
// cannot be used if user is already logged in
// validator will make sure the email and password aren't empty values
// If the email and password are empty, there's no reason to hit the db
// passport will authenticate the request and send a jwt token or let the user know the request was bad
router.post("/auth");

// gets info on a specific user
// must be logged in. Passport authenticates the request
router.get("/:userId");

// edits user info
// must be logged in AND must be the user who is being edited
// controller throws 403 error if you try to edit another user
router.put("/:userId");

module.exports = router;
