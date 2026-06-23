const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalText: String,
  fileUrl: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  analysis: {
    candidateProfile: {
      primaryDomain: String,
      experienceLevel: String,
      coreStrength: String,
    },
    technicalSkills: [String],
    impactAnalysis: {
      hasMeasurableMetrics: Boolean,
      missingMetricsExamples: [String],
      improvedBulletSuggestions: [String],
    },
    contentWeaknesses: [String],
    atsOptimizationTips: [String],
    scoreBreakdown: {
      technicalDepth: Number,
      impact: Number,
      clarity: Number,
      projectStrength: Number,
      industryReadiness: Number,
      overallScore: Number,
    },
    recommendedRoles: [String],
    suggestions: [String],
  },
  lastUpdated: Date,
});

module.exports = mongoose.model("Resume", resumeSchema);
