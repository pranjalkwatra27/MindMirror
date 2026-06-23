const Interview = require("../models/Interview");
const User = require("../models/User");
const Progress = require("../models/Progress");
const { analyzeVoiceComplete } = require("../utils/voiceAnalysis");
const DemoDatabase = require("../utils/demoDatabase");
const {
  generateInterviewQuestions,
  evaluateAnswer,
  generateDSAWeaknessList,
} = require("../utils/aiService");

// Helper to check if using demo mode
const isMongoDBConnected = async () => {
  try {
    const mongoose = require("mongoose");
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Sample questions for demo mode
const demoQuestions = {
  HR: [
    { question: "Tell me about yourself", category: "General", difficulty: "Easy" },
    { question: "Why do you want to work here?", category: "Motivation", difficulty: "Easy" },
    { question: "Describe a challenging situation you faced", category: "Behavioral", difficulty: "Medium" },
    { question: "How do you handle criticism?", category: "Behavioral", difficulty: "Medium" },
    { question: "Where do you see yourself in 5 years?", category: "Career", difficulty: "Medium" },
  ],
  Technical: [
    { question: "Explain the concept of closure in JavaScript", category: "JavaScript", difficulty: "Medium" },
    { question: "What is the difference between let, const, and var?", category: "JavaScript", difficulty: "Medium" },
    { question: "Design a database schema for an e-commerce application", category: "Database Design", difficulty: "Hard" },
    { question: "Explain the concept of async/await", category: "JavaScript", difficulty: "Medium" },
    { question: "What are microservices and their benefits?", category: "Architecture", difficulty: "Hard" },
  ],
  Behavioral: [
    { question: "Tell me about a time you worked in a team", category: "Teamwork", difficulty: "Medium" },
    { question: "Describe a conflict you had with a colleague and how you resolved it", category: "Conflict Resolution", difficulty: "Hard" },
    { question: "Give an example of when you took the lead on a project", category: "Leadership", difficulty: "Hard" },
    { question: "Tell me about a time you failed and what you learned", category: "Learning", difficulty: "Hard" },
    { question: "How do you prioritize your work?", category: "Time Management", difficulty: "Medium" },
  ],
  "Rapid-Fire-DSA": [
    { question: "Find the maximum element in an array", category: "Array", difficulty: "Easy" },
    { question: "Check if a string is a palindrome", category: "String", difficulty: "Easy" },
    { question: "Implement binary search", category: "Searching", difficulty: "Medium" },
    { question: "Find the longest common subsequence", category: "Dynamic Programming", difficulty: "Hard" },
    { question: "Detect a cycle in a linked list", category: "Linked List", difficulty: "Medium" },
  ],
};

// Start Interview Session
const startInterview = async (req, res) => {
  try {
    const { mode, targetRole } = req.body;
    const userId = req.userId;

    if (!["HR", "Technical", "Behavioral", "Rapid-Fire-DSA"].includes(mode)) {
      return res.status(400).json({ error: "Invalid interview mode" });
    }

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // MongoDB mode
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate questions using AI service
      const questions = await generateInterviewQuestions(
        {
          skills: user.skills,
          yearsOfExperience: user.yearsOfExperience,
        },
        mode,
        5
      );

      // Create interview session
      const interview = new Interview({
        userId: userId,
        mode: mode,
        targetRole: targetRole || user.targetRole,
        startTime: new Date(),
        questions: questions.map((q) => ({
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
        })),
      });

      await interview.save();

      return res.json({
        success: true,
        interviewId: interview._id,
        questions: questions,
        message: "Interview session started (MongoDB)",
      });
    } else {
      // Demo mode — always try AI for fresh questions, fall back to static only if AI fails
      let questions;
      try {
        questions = await generateInterviewQuestions(
          { skills: ["JavaScript", "React", "Node.js", "Python", "Communication", "Teamwork"], yearsOfExperience: 1 },
          mode,
          5
        );
      } catch {
        questions = demoQuestions[mode] || demoQuestions.HR;
      }

      const interview = DemoDatabase.createInterview({
        userId: userId,
        mode: mode,
        targetRole: targetRole || "Full-Stack",
        startTime: new Date(),
        questions: questions,
      });

      return res.json({
        success: true,
        interviewId: interview._id,
        questions: questions,
        message: "Interview session started",
        mode: "demo",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Answer
const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, userAnswer } = req.body;

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // MongoDB mode
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      if (questionIndex >= interview.questions.length) {
        return res.status(400).json({ error: "Invalid question index" });
      }

      const question = interview.questions[questionIndex];

      // Evaluate answer using AI
      const evaluation = await evaluateAnswer(
        question.question,
        userAnswer,
        interview.mode
      );

      // Update question with answer and evaluation
      question.userAnswer = userAnswer;
      question.answerDuration = req.body.duration || 0;

      // Save evaluation scores
      if (!interview.scores) {
        interview.scores = {};
      }

      // Accumulate scores
      if (!interview.scores.technicalAccuracy) {
        interview.scores.technicalAccuracy = 0;
      }
      interview.scores.technicalAccuracy =
        (interview.scores.technicalAccuracy * questionIndex + evaluation.score) /
        (questionIndex + 1);

      await interview.save();

      return res.json({
        success: true,
        evaluation: evaluation,
        message: "Answer submitted and evaluated (MongoDB)",
      });
    } else {
      // Demo mode — use real AI evaluation, fall back to static if AI fails
      let evaluation;
      try {
        const interview = DemoDatabase.findInterviewById(interviewId);
        const questionText = interview?.questions?.[questionIndex]?.question || "Tell me about yourself";
        const interviewMode = interview?.mode || "HR";
        evaluation = await evaluateAnswer(questionText, userAnswer, interviewMode);
      } catch {
        evaluation = {
          score: 72,
          feedback: "Good answer. Consider adding specific examples with measurable outcomes to strengthen your response.",
          strengths: ["Clear communication", "Relevant response"],
          areasForImprovement: ["Add concrete examples", "Quantify your achievements"],
          keyPointsMissed: [],
        };
      }

      return res.json({
        success: true,
        evaluation: evaluation,
        message: "Answer submitted and evaluated",
        mode: "demo",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete Interview
const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // MongoDB mode
      const interview = await Interview.findById(interviewId);

      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      interview.endTime = new Date();
      interview.duration = Math.round(
        (interview.endTime - interview.startTime) / 1000
      );
      interview.completed = true;

      // Calculate overall scores
      const technicalScores = interview.questions
        .filter((q) => q.userAnswer)
        .map((q) => q.answerDuration || 0);

      interview.scores.overallScore = interview.scores.technicalAccuracy || 0;

      // Generate DSA weakness list if technical round
      if (interview.mode === "Rapid-Fire-DSA") {
        const weaknesses = await generateDSAWeaknessList(interview.questions);
        interview.dsaWeaknessList = weaknesses.weakTopics;
      }

      await interview.save();

      // Update user progress safely
      const user = await User.findById(interview.userId);
      if (user) {
        if (!user.progressMetrics) {
          user.progressMetrics = {
            totalInterviews: 0,
            averageConfidenceScore: 0,
            averageClarityScore: 0,
            weakAreas: [],
            strongAreas: [],
            placementReadinessScore: 0
          };
        }
        
        user.progressMetrics.totalInterviews = (user.progressMetrics.totalInterviews || 0) + 1;
        const total = user.progressMetrics.totalInterviews;
        const currentConfidence = interview.scores?.confidenceScore || 75;
        const currentClarity = interview.scores?.clarityScore || 75;
        
        user.progressMetrics.averageConfidenceScore = Math.round(
          ((user.progressMetrics.averageConfidenceScore || 0) * (total - 1) + currentConfidence) / total
        );
        user.progressMetrics.averageClarityScore = Math.round(
          ((user.progressMetrics.averageClarityScore || 0) * (total - 1) + currentClarity) / total
        );
        
        await user.save();
      }

      return res.json({
        success: true,
        interview: interview,
        message: "Interview completed successfully (MongoDB)",
      });
    } else {
      // Demo mode
      return res.json({
        success: true,
        interview: {
          _id: interviewId,
          completed: true,
          scores: {
            overallScore: 78,
            technicalAccuracy: 80,
            confidenceScore: 75,
          },
        },
        message: "Interview completed successfully (Demo Mode)",
        mode: "demo",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Interview History
const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.userId;

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // MongoDB mode
      const interviews = await Interview.find({ userId: userId })
        .sort({ startTime: -1 })
        .limit(10);

      return res.json({
        success: true,
        interviews: interviews,
      });
    } else {
      // Demo mode - return empty array
      return res.json({
        success: true,
        interviews: [],
        message: "No interviews in demo mode",
        mode: "demo",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
};
