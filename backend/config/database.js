const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/evolveai";
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.warn("⚠️  MongoDB Available, running in demo mode");
    console.log("   Note: Data will not persist between sessions without MongoDB");
    // Don't exit - allow app to run in demo mode
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB Disconnected");
  } catch (error) {
    console.error("❌ MongoDB Disconnection Failed:", error.message);
  }
};

module.exports = { connectDB, disconnectDB };
