const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mindmirror";
    await mongoose.connect(mongoURL);
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.warn("⚠️  MongoDB offline, running in Demo Mode with in-memory persistence");
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
