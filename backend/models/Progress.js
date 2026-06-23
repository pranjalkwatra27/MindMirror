const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  metrics: {
    totalInterviews: { type: Number, default: 0 },
    hrRounds: { type: Number, default: 0 },
    technicalRounds: { type: Number, default: 0 },
    behavioralRounds: { type: Number, default: 0 },
    dsaRounds: { type: Number, default: 0 },
  },
  scoreHistory: [
    {
      interviewId: mongoose.Schema.Types.ObjectId,
      date: Date,
      confidenceScore: Number,
      clarityScore: Number,
      overallScore: Number,
      mode: String,
    },
  ],
  weeklyProgress: [
    {
      weekStart: Date,
      averageConfidence: Number,
      averageClarity: Number,
      interviewsCompleted: Number,
    },
  ],
  monthlyProgress: [
    {
      month: Date,
      averageScore: Number,
      interviewsCompleted: Number,
      improvementTrend: Number,
    },
  ],
  weakAreas: [
    {
      topic: String,
      frequency: Number,
      lastPracticedDate: Date,
      suggestedResources: [String],
    },
  ],
  strongAreas: [
    {
      topic: String,
      averageScore: Number,
    },
  ],
  placementReadiness: {
    score: { type: Number, default: 0 },
    lastUpdated: Date,
    breakdown: {
      technicalScore: Number,
      communicationScore: Number,
      behavioralScore: Number,
      dsaScore: Number,
    },
  },
  learningRoadmap: [
    {
      phase: String,
      topics: [String],
      estimatedDays: Number,
      priority: String,
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Progress", progressSchema);
