const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "professional"],
    default: "student",
  },
  targetRole: {
    type: String,
    enum: ["Frontend", "Backend", "Full-Stack", "DevOps", "Data Science", "QA", "Other"],
    default: "Full-Stack",
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
  },
  skills: [String],
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resume",
  },
  interviewHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
    },
  ],
  progressMetrics: {
    totalInterviews: { type: Number, default: 0 },
    averageConfidenceScore: { type: Number, default: 0 },
    averageClarityScore: { type: Number, default: 0 },
    weakAreas: [String],
    strongAreas: [String],
    placementReadinessScore: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
