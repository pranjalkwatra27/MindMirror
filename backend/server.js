const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Initialize app
const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5500", process.env.FRONTEND_URL || "http://localhost:3001"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create upload directories
const uploadDirs = ["uploads", "uploads/resumes", "uploads/audio"];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Static files
app.use(express.static("uploads"));

// Database connection
const { connectDB } = require("./config/database");
connectDB();

// Routes
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const dsaRoutes = require("./routes/dsaRoutes");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dsa", dsaRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "EvolveAI Backend is running",
    timestamp: new Date(),
    version: "3.0.0",
    database: "MongoDB configured"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

const PORT = process.env.PORT || 3000;

// Start Server
app.listen(PORT, () => {
  console.log(`
🚀 EvolveAI Backend Server Started
🌐 URL: http://localhost:${PORT}
📊 API: /api/auth, /api/interview, /api/voice, /api/dashboard, /api/dsa
❤️  Health: /api/health
  `);
});

module.exports = app;