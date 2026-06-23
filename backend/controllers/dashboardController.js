const User = require("../models/User");
const Interview = require("../models/Interview");
const Progress = require("../models/Progress");
const DemoDatabase = require("../utils/demoDatabase");
const { generatePlacementReadiness } = require("../utils/aiService");

// Helper to check if using demo mode
const isMongoDBConnected = async () => {
  try {
    const mongoose = require("mongoose");
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Get Dashboard Data
const getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // MongoDB version
      const user = await User.findById(userId);
      const interviews = await Interview.find({ userId: userId }).sort({
        startTime: -1,
      });
      const progress = await Progress.findOne({ userId: userId });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const totalInterviews = interviews.length;
      const completedInterviews = interviews.filter(
        (i) => i.completed === true
      ).length;
      const averageConfidence =
        interviews.length > 0
          ? interviews.reduce((sum, i) => sum + (i.scores?.confidenceScore || 0), 0) /
            interviews.length
          : 0;
      const averageClarity =
        interviews.length > 0
          ? interviews.reduce((sum, i) => sum + (i.scores?.clarityScore || 0), 0) /
            interviews.length
          : 0;

      const modeStats = {
        hr: interviews.filter((i) => i.mode === "HR").length,
        technical: interviews.filter((i) => i.mode === "Technical").length,
        behavioral: interviews.filter((i) => i.mode === "Behavioral").length,
        dsa: interviews.filter((i) => i.mode === "Rapid-Fire-DSA").length,
      };

      const scoreTrend = interviews
        .slice(0, 5)
        .reverse()
        .map((i) => ({
          date: i.startTime,
          score: i.scores?.overallScore || 0,
        }));

      const weakAreas = [];
      interviews.forEach((interview) => {
        if (interview.weakAreasIdentified) {
          weakAreas.push(...interview.weakAreasIdentified);
        }
      });

      const weakAreasCount = {};
      weakAreas.forEach((area) => {
        weakAreasCount[area] = (weakAreasCount[area] || 0) + 1;
      });

      const topWeakAreas = Object.entries(weakAreasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([area, count]) => ({ area, frequency: count }));

      return res.json({
        success: true,
        dashboard: {
          userInfo: {
            name: user.name,
            email: user.email,
            targetRole: user.targetRole,
            yearsOfExperience: user.yearsOfExperience,
          },
          metrics: {
            totalInterviews,
            completedInterviews,
            averageConfidence: averageConfidence.toFixed(2),
            averageClarity: averageClarity.toFixed(2),
            placementReadinessScore: user.progressMetrics?.placementReadinessScore || 0,
          },
          modeStats,
          scoreTrend,
          weakAreas: topWeakAreas,
          recentInterviews: interviews.slice(0, 5),
        },
      });
    } else {
      // Demo mode
      const user = DemoDatabase.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        success: true,
        mode: "demo",
        dashboard: {
          userInfo: {
            name: user.name,
            email: user.email,
            targetRole: user.targetRole,
            yearsOfExperience: user.yearsOfExperience || 0,
          },
          metrics: {
            totalInterviews: 0,
            completedInterviews: 0,
            averageConfidence: 0,
            averageClarity: 0,
            placementReadinessScore: 0,
          },
          modeStats: {
            hr: 0,
            technical: 0,
            behavioral: 0,
            dsa: 0,
          },
          scoreTrend: [],
          weakAreas: [],
          recentInterviews: [],
        },
      });
    }
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Demo mode: " + error.message });
  }
};

// Get Progress Report
const getProgressReport = async (req, res) => {
  try {
    const userId = req.userId;

    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const progress = await Progress.findOne({ userId: userId });

      if (!progress) {
        return res.status(404).json({ error: "Progress not found" });
      }

      return res.json({
        success: true,
        progress: progress,
      });
    } else {
      // Demo mode
      const progress = DemoDatabase.getProgressByUserId(userId);

      return res.json({
        success: true,
        mode: "demo",
        progress: progress || {
          userId: userId,
          placementReadiness: { score: 0, breakdown: {} },
          metrics: {},
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate Placement Readiness Score
const generatePlacementScore = async (req, res) => {
  try {
    const userId = req.userId;

    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findById(userId);
      const interviews = await Interview.find({ userId: userId });

      const metrics = {
        avgConfidence:
          interviews.reduce((sum, i) => sum + (i.scores?.confidenceScore || 0), 0) /
          (interviews.length || 1),
        avgClarity:
          interviews.reduce((sum, i) => sum + (i.scores?.clarityScore || 0), 0) /
          (interviews.length || 1),
        techAccuracy:
          interviews
            .filter((i) => i.mode === "Technical")
            .reduce((sum, i) => sum + (i.scores?.technicalAccuracy || 0), 0) /
          (interviews.filter((i) => i.mode === "Technical").length || 1),
        totalInterviews: interviews.length,
        weakAreas: user.progressMetrics?.weakAreas || [],
      };

      const placementReadiness = await generatePlacementReadiness(metrics);

      user.progressMetrics.placementReadinessScore =
        placementReadiness.placementReadinessScore;

      await user.save();

      return res.json({
        success: true,
        placementReadiness: placementReadiness,
      });
    } else {
      // Demo mode
      return res.json({
        success: true,
        mode: "demo",
        placementReadiness: {
          placementReadinessScore: 0,
          breakdown: {},
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboardData,
  getProgressReport,
  generatePlacementScore,
};
