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

      const completedRoadmapDays = user.roadmap ? user.roadmap.filter(r => r.completed).length : 0;
      const totalRoadmapDays = user.roadmap ? user.roadmap.length : 21;
      const todayTask = user.roadmap?.find(r => !r.completed) || user.roadmap?.[0] || {
        day: 1,
        title: "DSA Arrays & Closures",
        task: "Revise Two Pointers and complete 1 mock technical interview.",
        category: "DSA"
      };

      const breakdown = user.readinessBreakdown || {
        technical: 68,
        dsa: 62,
        resume: 75,
        communication: 70,
        projects: 65,
        behavioral: 72,
        overall: 69,
        lastDeltaExplanation: "Readiness initialized at 69%. Practice Technical and DSA modules to accelerate your placement probability."
      };

      const copilot = {
        primaryAction: `Day ${todayTask.day}: ${todayTask.title}`,
        primaryTask: todayTask.task,
        targetCompany: user.targetCompanies?.[0] || "Top Tech",
        daysRemaining: user.targetDays || 21,
        deltaExplanation: breakdown.lastDeltaExplanation || "Your recent activity has boosted communication and core CS consistency.",
        urgentFocusArea: topWeakAreas[0]?.area || "Dynamic Programming & STAR structure",
      };

      return res.json({
        success: true,
        dashboard: {
          userInfo: {
            name: user.name,
            email: user.email,
            targetRole: user.targetRole,
            targetCompanies: user.targetCompanies || ["Google", "Amazon", "TCS"],
            yearsOfExperience: user.yearsOfExperience,
          },
          metrics: {
            totalInterviews,
            completedInterviews,
            averageConfidence: averageConfidence.toFixed(2),
            averageClarity: averageClarity.toFixed(2),
            placementReadinessScore: breakdown.overall || user.progressMetrics?.placementReadinessScore || 69,
          },
          readinessBreakdown: breakdown,
          copilot,
          roadmapSummary: {
            totalDays: totalRoadmapDays,
            completedDays: completedRoadmapDays,
            progressPercentage: Math.round((completedRoadmapDays / (totalRoadmapDays || 1)) * 100),
            todayTask,
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
            targetCompanies: ["Google", "Amazon", "TCS"],
            yearsOfExperience: user.yearsOfExperience || 0,
          },
          metrics: {
            totalInterviews: 4,
            completedInterviews: 4,
            averageConfidence: "78.00",
            averageClarity: "82.00",
            placementReadinessScore: 74,
          },
          readinessBreakdown: {
            technical: 78,
            dsa: 72,
            resume: 80,
            communication: 76,
            projects: 70,
            behavioral: 75,
            overall: 74,
            lastDeltaExplanation: "Readiness increased from 68% -> 74% because your DSA score improved by 12 points."
          },
          copilot: {
            primaryAction: "Day 3: React Hooks & Closures",
            primaryTask: "Solve 2 Medium Tree problems and complete a 5-question Technical mock.",
            targetCompany: "Google",
            daysRemaining: 18,
            deltaExplanation: "Readiness increased by +6% after completing Technical and DSA modules.",
            urgentFocusArea: "Tree Inversions & Binary Search"
          },
          roadmapSummary: {
            totalDays: 21,
            completedDays: 3,
            progressPercentage: 14,
            todayTask: { day: 4, title: "Mock Technical Interview", task: "Practice 1 Full Technical Round on MindMirror", category: "Mock Interview" }
          },
          modeStats: {
            hr: 1,
            technical: 2,
            behavioral: 0,
            dsa: 1,
          },
          scoreTrend: [
            { date: "Day 1", score: 62 },
            { date: "Day 2", score: 68 },
            { date: "Day 3", score: 74 },
          ],
          weakAreas: [{ area: "Dynamic Programming", frequency: 2 }],
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
      let progress = await Progress.findOne({ userId: userId });

      if (!progress) {
        progress = new Progress({ userId: userId });
        await progress.save();
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
