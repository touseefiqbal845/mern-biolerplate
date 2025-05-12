const databaseLoader = require("./databaseLoader");
const expressLoader = require("./expressLoader");
const routesLoader = require("./routesLoader");
// const initDataLoader = require("./initDataLoader");

const initializeLoaders = async (app) => {
  await databaseLoader();
  expressLoader(app);
  routesLoader(app);
  // await initDataLoader();
  console.log("everything load");
};

module.exports = initializeLoaders;
