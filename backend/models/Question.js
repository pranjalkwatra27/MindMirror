const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  mode: {
    type: String,
    enum: ["HR", "Technical", "Behavioral", "DSA"],
    required: true,
  },
  category: {
    type: String,
    enum: [
      "Arrays",
      "Strings",
      "Trees",
      "Graphs",
      "DP",
      "Recursion",
      "Communication",
      "Problem-Solving",
      "Leadership",
      "Conflict",
      "Motivation",
      "Experience",
      "General",
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  question: {
    type: String,
    required: true,
  },
  expectedKeyPoints: [String],
  sampleAnswers: [String],
  tipsForAnswering: [String],
  evaluationCriteria: [String],
  relatedSkills: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Question", questionSchema);
