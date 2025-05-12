const passport = require("passport");
const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();
const User = require("../modals/User");
const { cookieExtractor } = require("../services/common");

const passportConfig = () => {
  var opts = {};
  opts.jwtFromRequest = cookieExtractor;
  opts.secretOrKey = process.env.JWT_SECRET_KEY;

  passport.use(
    "jwt",
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          crypto.pbkdf2(
            password,
            user.salt,
            310000,
            32,
            "sha256",
            (err, hashedPassword) => {
              if (err) return done(err);

              if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                return done(null, false, {
                  message: "Invalid email or password",
                });
              }
              return done(null, user, { message: "Logged in successfully" });
            }
          );
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id, cb) => {
    try {
      const user = await User.findById(id);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });
};
module.exports = passportConfig;