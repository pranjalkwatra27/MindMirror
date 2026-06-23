const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mode: {
    type: String,
    enum: ["HR", "Technical", "Behavioral", "Rapid-Fire-DSA"],
    required: true,
  },
  targetRole: String,
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: Date,
  duration: Number, // in seconds
  questions: [
    {
      questionId: String,
      question: String,
      category: String,
      difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
      userAnswer: String,
      audioUrl: String,
      answerDuration: Number,
    },
  ],
  scores: {
    confidenceScore: Number,
    clarityScore: Number,
    technicalAccuracy: Number, // For technical rounds
    communicationScore: Number,
    overallScore: Number,
  },
  voiceAnalysis: {
    fillerWords: {
      total: Number,
      percentage: Number,
      breakdown: [{ word: String, count: Number }],
    },
    speakingSpeed: {
      wordsPerMinute: Number,
      assessment: String,
    },
    sentiment: {
      sentimentScore: Number,
      confidence: Number,
      hesitation: Number,
    },
    pauses: {
      estimatedDuration: Number,
      frequency: Number,
    },
  },
  feedback: {
    strengths: [String],
    areasForImprovement: [String],
    actionablesuggestions: [String],
  },
  weakAreasIdentified: [String],
  dsaWeaknessList: [
    {
      topic: String,
      difficulty: String,
      suggestedResources: [String],
    },
  ],
  placementReadinessIncrease: Number,
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Interview", interviewSchema);
