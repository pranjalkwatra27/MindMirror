const User = require("../models/User");
const Interview = require("../models/Interview");
const Progress = require("../models/Progress");
const { generateToken } = require("../config/auth");
const DemoDatabase = require("../utils/demoDatabase");
const bcrypt = require("bcryptjs");

// Helper to check if using demo mode
const isMongoDBConnected = async () => {
  try {
    const mongoose = require("mongoose");
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, targetRole, yearsOfExperience } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // Use MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = new User({
        name,
        email,
        password,
        targetRole: targetRole || "Full-Stack",
        yearsOfExperience: yearsOfExperience || 0,
      });

      await user.save();

      const progress = new Progress({
        userId: user._id,
      });
      await progress.save();

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: "User registered successfully (MongoDB)",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
        },
      });
    } else {
      // Use Demo Database
      const existingUser = DemoDatabase.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = DemoDatabase.createUser({
        name,
        email,
        password: hashedPassword,
        targetRole: targetRole || "Full-Stack",
        yearsOfExperience: yearsOfExperience || 0,
      });

      DemoDatabase.createProgress({ userId: user._id });

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: "User registered successfully (Demo Mode)",
        token: token,
        mode: "demo",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // Use MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: "Login successful (MongoDB)",
        token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
        },
      });
    } else {
      // Use Demo Database
      const user = DemoDatabase.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        message: "Login successful (Demo Mode)",
        token: token,
        mode: "demo",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findById(userId)
        .select("-password")
        .populate("resumeId")
        .populate("interviewHistory");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        success: true,
        user: user,
      });
    } else {
      const user = DemoDatabase.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        success: true,
        mode: "demo",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, targetRole, yearsOfExperience, skills } = req.body;

    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          name: name || user.name,
          targetRole: targetRole || user.targetRole,
          yearsOfExperience: yearsOfExperience || user.yearsOfExperience,
          skills: skills || user.skills,
          updatedAt: new Date(),
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
        user: user,
      });
    } else {
      const user = DemoDatabase.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.name = name || user.name;
      user.targetRole = targetRole || user.targetRole;
      user.yearsOfExperience = yearsOfExperience || user.yearsOfExperience;

      return res.json({
        success: true,
        message: "Profile updated successfully (Demo Mode)",
        mode: "demo",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Candidate Memory & AI Context
const getCandidateMemory = async (req, res) => {
  try {
    const userId = req.userId;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findById(userId).select("name email targetRole targetCompanies targetDays skills candidateMemory readinessBreakdown");
      if (!user) return res.status(404).json({ error: "User not found" });

      return res.json({
        success: true,
        candidateMemory: {
          name: user.name,
          targetRole: user.targetRole,
          targetCompanies: user.targetCompanies || ["Google", "Amazon", "TCS"],
          targetDays: user.targetDays || 21,
          skills: user.skills || [],
          weakDSATopics: user.candidateMemory?.weakDSATopics || [],
          projectHighlights: user.candidateMemory?.projectHighlights || [],
          speechMetrics: user.candidateMemory?.speechMetrics || { baselineWpm: 130, fillerWordRatio: 0.05, confidenceAvg: 75 },
          recurringMistakes: user.candidateMemory?.recurringMistakes || [],
          lastInterviewerFeedback: user.candidateMemory?.lastInterviewerFeedback || "",
          readinessBreakdown: user.readinessBreakdown || {
            technical: 65, dsa: 60, resume: 70, communication: 68, projects: 65, behavioral: 70, overall: 66,
            lastDeltaExplanation: "Profile active and tracking."
          }
        }
      });
    } else {
      return res.json({
        success: true,
        candidateMemory: {
          name: "Demo Candidate",
          targetRole: "Full-Stack",
          targetCompanies: ["Google", "Amazon", "TCS"],
          targetDays: 21,
          skills: ["JavaScript", "React", "Node.js", "MongoDB", "Data Structures"],
          weakDSATopics: [{ topic: "Graph Algorithms", frequency: 2, lastTestedScore: 50 }],
          projectHighlights: [{ title: "E-Commerce Microservices", techStack: ["Node.js", "Docker", "MongoDB"], keyChallenges: "Handling flash sale throughput" }],
          speechMetrics: { baselineWpm: 135, fillerWordRatio: 0.04, confidenceAvg: 78 },
          recurringMistakes: ["Forgot to state time complexity upfront"],
          lastInterviewerFeedback: "Good technical explanation, improve STAR story metrics.",
          readinessBreakdown: { technical: 72, dsa: 68, resume: 78, communication: 75, projects: 70, behavioral: 74, overall: 73, lastDeltaExplanation: "Strong performance across full-stack rounds." }
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Candidate Memory (Target Companies, Projects, etc.)
const updateCandidateMemory = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetRole, targetCompanies, targetDays, projectHighlights, speechMetrics, candidateMemory } = req.body;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const updatePayload = { updatedAt: new Date() };
      if (targetRole) updatePayload.targetRole = targetRole;
      if (targetCompanies) updatePayload.targetCompanies = targetCompanies;
      if (targetDays) updatePayload.targetDays = targetDays;
      if (projectHighlights) updatePayload["candidateMemory.projectHighlights"] = projectHighlights;
      if (speechMetrics) updatePayload["candidateMemory.speechMetrics"] = speechMetrics;
      if (candidateMemory?.weakDSATopics) {
        const formatted = candidateMemory.weakDSATopics.map(w => typeof w === 'string' ? { topic: w, frequency: 1 } : w);
        updatePayload["candidateMemory.weakDSATopics"] = formatted;
      }

      const user = await User.findByIdAndUpdate(userId, { $set: updatePayload }, { new: true });
      return res.json({ success: true, message: "Candidate memory updated", user });
    } else {
      return res.json({ success: true, message: "Candidate memory updated (Demo Mode)" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getCandidateMemory,
  updateCandidateMemory,
};
