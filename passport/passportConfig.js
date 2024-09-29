const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwtPassport = require("passport-jwt");
const bcrypt = require("bcrypt");
const client = require("../prisma/client");

const JwtStrategy = jwtPassport.Strategy;
const ExtractJwt = jwtPassport.ExtractJwt;

const localVerify = async (email, pw, done) => {
  try {
    const user = await client.users.findUnique({ where: { email: email } });
    if (!user) return done(null, false);

    const match = await bcrypt.compare(pw, user.pw);
    if (!match) return done(null, false);

    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
};

const jwtVerify = async (jwt_payload, done) => {
  try {
    if (!jwt_payload) return done(null, false);
    return done(null, jwt_payload);
  } catch (err) {
    return done(err, false);
  }
};

const localStrat = new LocalStrategy(
  { usernameField: "email", passwordField: "pw" },
  localVerify
);
const jwtStrat = new JwtStrategy(
  {
    secretOrKey: process.env.SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  jwtVerify
);

passport.use(localStrat);
passport.use(jwtStrat);

module.exports = passport;
