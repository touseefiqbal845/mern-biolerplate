const express = require("express");
const cors = require("cors");
const loaders = require("./loaders");
const errorHandler = require("./utils/errorHandler");

const app = express();

const startApp = async () => {
  await loaders(app);
  app.use(errorHandler);
  console.log("Application initialized.");
};

startApp();

module.exports = app;
