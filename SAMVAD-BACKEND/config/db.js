const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/samvad_local",
      { serverSelectionTimeoutMS: 10000 }
    );

    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
