const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
dotenv.config();

const sessionConfig = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "None",
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );
};

module.exports = sessionConfig;
