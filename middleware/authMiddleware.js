const passport = require("passport");

const jwtAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: info?.message || "Unauthorized" });

    req.user = user;
    next();
  })(req, res, next);
};


const sessionAuth = (req, res, next) => {
  passport.authenticate("session", { session: false }, (err, user, info) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: info?.message || "Unauthorized" });

    req.user = user;
    next();
  })(req, res, next);
};


const localAuth = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
    });
  }
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });

    if (!user)
      return res.status(401).json({
        success: false,
        message: info?.message || "Invalid credentials",
      });

      req.user = { ...user.toObject(), message: info?.message };
    next();
  })(req, res, next);
};

module.exports = { jwtAuth, sessionAuth, localAuth };
