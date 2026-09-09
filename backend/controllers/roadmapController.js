const User = require("../models/User");
const { generateRoadmapPlan } = require("../utils/aiService");

const isMongoDBConnected = async () => {
  try {
    const mongoose = require("mongoose");
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Generate / Regenerate Placement Roadmap
const generateRoadmap = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetRole, targetCompany, targetDays } = req.body;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const days = Number(targetDays) || user.targetDays || 21;
      const role = targetRole || user.targetRole || "Full-Stack";
      const company = targetCompany || (user.targetCompanies && user.targetCompanies[0]) || "Top Tech";
      const readiness = user.readinessBreakdown?.overall || 65;

      const roadmapDays = await generateRoadmapPlan({
        targetRole: role,
        targetCompany: company,
        targetDays: days,
        currentReadiness: readiness,
        skills: user.skills || [],
        weakTopics: user.candidateMemory?.weakDSATopics || [],
        experienceYears: user.yearsOfExperience || 0,
      });

      user.roadmap = roadmapDays;
      if (targetRole) user.targetRole = targetRole;
      if (targetDays) user.targetDays = days;
      if (targetCompany && !user.targetCompanies.includes(targetCompany)) {
        user.targetCompanies.unshift(targetCompany);
      }
      user.updatedAt = new Date();
      await user.save();

      return res.json({
        success: true,
        message: "Placement roadmap generated successfully",
        roadmap: user.roadmap,
        targetCompany: company,
        targetRole: role,
        targetDays: days,
      });
    } else {
      const roadmapDays = await generateRoadmapPlan({
        targetRole: targetRole || "Full-Stack",
        targetCompany: targetCompany || "Google",
        targetDays: targetDays || 21,
        currentReadiness: 70,
        skills: ["JavaScript", "React", "Node.js"],
        weakTopics: [{ topic: "Graph Algorithms" }],
        experienceYears: 1,
      });

      return res.json({
        success: true,
        message: "Placement roadmap generated successfully (Demo Mode)",
        roadmap: roadmapDays,
        targetCompany: targetCompany || "Google",
        targetRole: targetRole || "Full-Stack",
        targetDays: targetDays || 21,
      });
    }
  } catch (error) {
    console.error("Error in generateRoadmap:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Current User's Roadmap
const getRoadmap = async (req, res) => {
  try {
    const userId = req.userId;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      if (!user.roadmap || user.roadmap.length === 0) {
        // Auto-generate initial roadmap
        const roadmapDays = await generateRoadmapPlan({
          targetRole: user.targetRole || "Full-Stack",
          targetCompany: (user.targetCompanies && user.targetCompanies[0]) || "Google",
          targetDays: user.targetDays || 21,
          currentReadiness: user.readinessBreakdown?.overall || 65,
          skills: user.skills || [],
          weakTopics: user.candidateMemory?.weakDSATopics || [],
          experienceYears: user.yearsOfExperience || 0,
        });
        user.roadmap = roadmapDays;
        await user.save();
      }

      const completedCount = user.roadmap.filter((d) => d.completed).length;
      const progressPercentage = Math.round((completedCount / user.roadmap.length) * 100) || 0;

      return res.json({
        success: true,
        roadmap: user.roadmap,
        targetCompany: (user.targetCompanies && user.targetCompanies[0]) || "Top Tech",
        targetRole: user.targetRole,
        targetDays: user.targetDays || 21,
        stats: {
          totalDays: user.roadmap.length,
          completedDays: completedCount,
          progressPercentage,
        },
      });
    } else {
      const demoRoadmap = await generateRoadmapPlan({
        targetRole: "Full-Stack",
        targetCompany: "Google",
        targetDays: 21,
        currentReadiness: 70,
        skills: ["JavaScript", "React", "Node.js"],
        weakTopics: [{ topic: "Graph Algorithms" }],
        experienceYears: 1,
      });

      return res.json({
        success: true,
        roadmap: demoRoadmap,
        targetCompany: "Google",
        targetRole: "Full-Stack",
        targetDays: 21,
        stats: {
          totalDays: 21,
          completedDays: 3,
          progressPercentage: 14,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Toggle Task Completion State
const toggleTaskCompletion = async (req, res) => {
  try {
    const userId = req.userId;
    const { day } = req.body;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const dayItem = user.roadmap.find((d) => d.day === Number(day));
      if (!dayItem) return res.status(404).json({ error: "Day task not found in roadmap" });

      dayItem.completed = !dayItem.completed;
      user.updatedAt = new Date();
      await user.save();

      return res.json({
        success: true,
        message: `Day ${day} marked as ${dayItem.completed ? "completed" : "pending"}`,
        day: dayItem,
      });
    } else {
      return res.json({
        success: true,
        message: `Day ${day} status updated (Demo Mode)`,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateRoadmap,
  getRoadmap,
  toggleTaskCompletion,
};
