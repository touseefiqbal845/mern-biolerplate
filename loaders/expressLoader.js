const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sessionConfig = require("../Config/session");
const passport = require("passport");
const passportConfig = require("../Config/passport");

const expressLoader = (app) => {
  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());

  sessionConfig(app);
  passportConfig();
  app.use(passport.initialize());
  // app.use(passport.session());

  console.log("Express middleware initialized");
};

module.exports = expressLoader;
