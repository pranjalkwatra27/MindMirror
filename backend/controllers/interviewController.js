const Interview = require("../models/Interview");
const User = require("../models/User");
const Progress = require("../models/Progress");
const { analyzeVoiceComplete } = require("../utils/voiceAnalysis");
const DemoDatabase = require("../utils/demoDatabase");
const {
  generateInterviewQuestions,
  evaluateAnswer,
  evaluateAnswerWithSTAR,
  generateFollowUpQuestion,
  generateDSAWeaknessList,
  generateProjectDeepDiveQuestions,
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
    { question: "Tell me about yourself and your professional journey.", category: "General", difficulty: "Easy" },
    { question: "Why are you interested in joining our engineering team?", category: "Motivation", difficulty: "Easy" },
    { question: "Describe a challenging situation in a project and how you resolved it.", category: "Behavioral", difficulty: "Medium" },
    { question: "How do you handle ambiguous requirements and tight deadlines?", category: "Behavioral", difficulty: "Medium" },
    { question: "Where do you envision your engineering career in the next 3-5 years?", category: "Career", difficulty: "Medium" },
  ],
  Technical: [
    { question: "Explain JavaScript closures, the event loop, and microtask vs macrotask execution.", category: "JavaScript", difficulty: "Medium" },
    { question: "Compare relational SQL (PostgreSQL) vs NoSQL (MongoDB) in high-throughput systems.", category: "Database Design", difficulty: "Medium" },
    { question: "How does React fiber reconciliation work under the hood with hooks?", category: "Frontend", difficulty: "Hard" },
    { question: "Design an API caching strategy using Redis and explain cache invalidation patterns.", category: "System Design", difficulty: "Hard" },
    { question: "What are microservices vs monoliths and how do you handle distributed transactions?", category: "Architecture", difficulty: "Hard" },
  ],
  Behavioral: [
    { question: "Tell me about a time you had a technical disagreement with a colleague and reached consensus.", category: "Conflict Resolution", difficulty: "Hard" },
    { question: "Describe a critical production bug you introduced and how you handled root-cause analysis.", category: "Accountability", difficulty: "Hard" },
    { question: "Give an example of when you took initiative to refactor legacy code or improve developer experience.", category: "Leadership", difficulty: "Medium" },
    { question: "Describe how you prioritize technical debt versus building new product features.", category: "Prioritization", difficulty: "Medium" },
    { question: "Tell me about a time you had to learn a completely new framework under tight delivery deadlines.", category: "Learning", difficulty: "Medium" },
  ],
  "Rapid-Fire-DSA": [
    { question: "Find all pairs in an array that sum to a target value in O(n) time.", category: "Array & Hash Table", difficulty: "Easy" },
    { question: "Detect if a cycle exists in a directed graph using DFS / recursion stack.", category: "Graph", difficulty: "Medium" },
    { question: "Implement an LRU Cache with O(1) get and put operations.", category: "Design & Linked List", difficulty: "Hard" },
    { question: "Find the longest palindromic substring using dynamic programming or expansion around centers.", category: "Dynamic Programming", difficulty: "Medium" },
    { question: "Serialize and deserialize a Binary Tree efficiently.", category: "Tree", difficulty: "Hard" },
  ],
};

// Start Interview Session
const startInterview = async (req, res) => {
  try {
    const { mode, targetRole, targetCompany } = req.body;
    const userId = req.userId;

    if (!["HR", "Technical", "Behavioral", "Rapid-Fire-DSA"].includes(mode)) {
      return res.status(400).json({ error: "Invalid interview mode" });
    }

    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const questions = await generateInterviewQuestions(
        {
          skills: user.skills,
          yearsOfExperience: user.yearsOfExperience,
        },
        mode,
        5
      );

      const interview = new Interview({
        userId: userId,
        mode: mode,
        targetRole: targetRole || user.targetRole,
        startTime: new Date(),
        questions: questions.map((q) => ({
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          tips: q.tips || [],
        })),
      });

      await interview.save();

      return res.json({
        success: true,
        interviewId: interview._id,
        questions: questions,
        candidateContext: {
          targetRole: user.targetRole,
          targetCompany: targetCompany || user.targetCompanies?.[0] || "Top Tech",
          weakDSATopics: user.candidateMemory?.weakDSATopics || [],
        },
        message: "Interview session started",
      });
    } else {
      let questions;
      try {
        questions = await generateInterviewQuestions(
          { skills: ["JavaScript", "React", "Node.js", "Python", "Data Structures"], yearsOfExperience: 1 },
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
        message: "Interview session started (Demo Mode)",
        mode: "demo",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Answer & Evaluate with STAR + Optional Dynamic Follow-Up
const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, userAnswer, requestFollowUp } = req.body;
    const userId = req.userId;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const interview = await Interview.findById(interviewId);
      if (!interview) return res.status(404).json({ error: "Interview not found" });

      if (questionIndex >= interview.questions.length) {
        return res.status(400).json({ error: "Invalid question index" });
      }

      const question = interview.questions[questionIndex];
      const user = await User.findById(userId);

      // Multi-dimensional STAR evaluation
      const starEval = await evaluateAnswerWithSTAR(
        question.question,
        userAnswer,
        interview.mode
      );

      question.userAnswer = userAnswer;
      question.answerDuration = req.body.duration || 0;
      question.score = starEval.overallScore;
      question.feedback = starEval.feedback;

      if (!interview.scores) interview.scores = {};
      const currentAvg = interview.scores.technicalAccuracy || 0;
      interview.scores.technicalAccuracy = Math.round(
        (currentAvg * questionIndex + starEval.overallScore) / (questionIndex + 1)
      );

      // Track weak categories
      if (starEval.overallScore < 65 && question.category) {
        if (!interview.weakAreasIdentified) interview.weakAreasIdentified = [];
        if (!interview.weakAreasIdentified.includes(question.category)) {
          interview.weakAreasIdentified.push(question.category);
        }
      }

      let followUp = null;
      if (requestFollowUp !== false) {
        followUp = await generateFollowUpQuestion({
          previousQuestion: question.question,
          candidateAnswer: userAnswer,
          candidateMemory: user?.candidateMemory || {},
          mode: interview.mode,
          currentDifficulty: question.difficulty || "Medium",
        });
      }

      await interview.save();

      return res.json({
        success: true,
        evaluation: {
          score: starEval.overallScore,
          dimensions: starEval.dimensions,
          starChecklist: starEval.starChecklist,
          strengths: starEval.strengths,
          areasForImprovement: starEval.areasForImprovement,
          feedback: starEval.feedback,
          idealAnswerSnippet: starEval.idealAnswerSnippet,
        },
        followUpQuestion: followUp,
        message: "Answer evaluated with STAR scoring",
      });
    } else {
      const starEval = await evaluateAnswerWithSTAR("Tell me about yourself", userAnswer, "Technical");
      return res.json({
        success: true,
        evaluation: {
          score: starEval.overallScore,
          dimensions: starEval.dimensions,
          starChecklist: starEval.starChecklist,
          strengths: starEval.strengths,
          areasForImprovement: starEval.areasForImprovement,
          feedback: starEval.feedback,
          idealAnswerSnippet: starEval.idealAnswerSnippet,
        },
        followUpQuestion: {
          followUpQuestion: "Can you elaborate on how your architectural design choice impacted query latency?",
          category: "Deep Dive",
          difficulty: "Medium",
          rationale: "Probing deeper into technical implementation and metrics.",
        },
        mode: "demo",
      });
    }
  } catch (error) {
    console.error("Error in submitAnswer:", error);
    res.status(500).json({ error: error.message });
  }
};

// Complete Interview & Sync Candidate Memory + Multidimensional Readiness
const completeInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const interview = await Interview.findById(interviewId);
      if (!interview) return res.status(404).json({ error: "Interview not found" });

      interview.endTime = new Date();
      interview.duration = Math.round(
        (interview.endTime - interview.startTime) / 1000
      );
      interview.completed = true;

      const scoredQuestions = interview.questions.filter((q) => q.score !== undefined);
      const avgScore = scoredQuestions.length > 0
        ? Math.round(scoredQuestions.reduce((acc, q) => acc + q.score, 0) / scoredQuestions.length)
        : (interview.scores?.technicalAccuracy || 70);

      interview.scores.overallScore = avgScore;

      if (interview.mode === "Rapid-Fire-DSA") {
        const weaknesses = await generateDSAWeaknessList(interview.questions);
        interview.dsaWeaknessList = weaknesses.weakTopics;
      }

      await interview.save();

      // Sync with user's Candidate Memory & Multidimensional Readiness
      const user = await User.findById(interview.userId);
      if (user) {
        if (!user.progressMetrics) {
          user.progressMetrics = { totalInterviews: 0, averageConfidenceScore: 70, averageClarityScore: 70, weakAreas: [] };
        }
        user.progressMetrics.totalInterviews = (user.progressMetrics.totalInterviews || 0) + 1;

        // Update weak DSA topics in candidate memory
        if (interview.weakAreasIdentified && interview.weakAreasIdentified.length > 0) {
          if (!user.candidateMemory) user.candidateMemory = { weakDSATopics: [] };
          interview.weakAreasIdentified.forEach((area) => {
            const existing = user.candidateMemory.weakDSATopics?.find((w) => w.topic === area);
            if (existing) {
              existing.frequency += 1;
            } else {
              user.candidateMemory.weakDSATopics.push({ topic: area, frequency: 1, lastTestedScore: avgScore });
            }
          });
        }

        // Multidimensional Score Update
        if (!user.readinessBreakdown) {
          user.readinessBreakdown = { technical: 65, dsa: 60, resume: 70, communication: 68, projects: 65, behavioral: 70, overall: 66 };
        }

        const prevOverall = user.readinessBreakdown.overall || 66;

        if (interview.mode === "Technical") {
          user.readinessBreakdown.technical = Math.round((user.readinessBreakdown.technical * 0.7) + (avgScore * 0.3));
        } else if (interview.mode === "Rapid-Fire-DSA") {
          user.readinessBreakdown.dsa = Math.round((user.readinessBreakdown.dsa * 0.7) + (avgScore * 0.3));
        } else if (interview.mode === "Behavioral") {
          user.readinessBreakdown.behavioral = Math.round((user.readinessBreakdown.behavioral * 0.7) + (avgScore * 0.3));
        } else if (interview.mode === "HR") {
          user.readinessBreakdown.communication = Math.round((user.readinessBreakdown.communication * 0.7) + (avgScore * 0.3));
        }

        const b = user.readinessBreakdown;
        const newOverall = Math.round(
          (b.technical * 0.25) +
          (b.dsa * 0.20) +
          (b.resume * 0.20) +
          (b.communication * 0.15) +
          (b.projects * 0.10) +
          (b.behavioral * 0.10)
        );

        user.readinessBreakdown.overall = newOverall;
        const diff = newOverall - prevOverall;
        const deltaStr = diff >= 0 ? `+${diff}` : `${diff}`;
        user.readinessBreakdown.lastDeltaExplanation = `Readiness changed from ${prevOverall}% to ${newOverall}% (${deltaStr}%) after completing a ${interview.mode} interview round with ${avgScore}% score.`;
        user.progressMetrics.placementReadinessScore = newOverall;
        user.candidateMemory.lastInterviewerFeedback = `Scored ${avgScore}% in ${interview.mode}. Focus on reinforcing STAR metrics and concrete implementation depth.`;

        await user.save();
      }

      return res.json({
        success: true,
        interview,
        readinessBreakdown: user?.readinessBreakdown,
        message: "Interview completed & Candidate Memory synchronized",
      });
    } else {
      return res.json({
        success: true,
        interview: {
          _id: interviewId,
          completed: true,
          scores: { overallScore: 82, technicalAccuracy: 85, confidenceScore: 78 },
        },
        readinessBreakdown: {
          technical: 78, dsa: 72, resume: 80, communication: 76, projects: 70, behavioral: 75, overall: 75,
          lastDeltaExplanation: "Readiness increased by +3% after completing mock interview."
        },
        mode: "demo",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate Deep Dive Questions for a candidate's project
const getProjectDeepDive = async (req, res) => {
  try {
    const { title, description, techStack } = req.body;
    const questions = await generateProjectDeepDiveQuestions(
      title || "Flagship Project",
      description || "Full-stack web application",
      Array.isArray(techStack) ? techStack : (techStack ? techStack.split(",") : ["React", "Node.js"])
    );

    return res.json({
      success: true,
      projectTitle: title,
      questions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Interview History
const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const interviews = await Interview.find({ userId: userId })
        .sort({ startTime: -1 })
        .limit(15);

      return res.json({
        success: true,
        interviews: interviews,
      });
    } else {
      return res.json({
        success: true,
        interviews: [],
        message: "Demo mode history",
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
  getProjectDeepDive,
};

