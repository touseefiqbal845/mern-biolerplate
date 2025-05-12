const connectDB = require("../Config/db");

const databaseLoader = async () => {
  await connectDB();
};

module.exports = databaseLoader;
