const { body, validationResult } = require("express-validator");

exports.singUpValidationRules = () => {
  return [
    body("username", "Username should be between 1 and 20 characters")
      .isString()
      .trim()
      .isLength({ max: 20, min: 1 }),
    body("email", "Please enter a valid email address").isEmail(),
    body("pw", "Please enter a password")
      .isString()
      .trim()
      .isLength({ min: 1 }),
    body("confirmPw", "Passwords must match")
      .isString()
      .trim()
      .custom((value, { req }) => {
        return value === req.body.pw;
      }),
  ];
};

exports.validateSignUp = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  else return res.status(400).json(errors);
};
