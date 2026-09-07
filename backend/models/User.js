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
  targetCompanies: {
    type: [String],
    default: ["Google", "Amazon", "TCS"],
  },
  targetDays: {
    type: Number,
    default: 21,
  },
  candidateMemory: {
    weakDSATopics: [
      {
        topic: String,
        frequency: { type: Number, default: 1 },
        lastTestedScore: { type: Number, default: 0 },
      }
    ],
    projectHighlights: [
      {
        title: String,
        techStack: [String],
        keyChallenges: String,
      }
    ],
    speechMetrics: {
      baselineWpm: { type: Number, default: 130 },
      fillerWordRatio: { type: Number, default: 0.05 },
      confidenceAvg: { type: Number, default: 75 },
    },
    recurringMistakes: [String],
    lastInterviewerFeedback: { type: String, default: "" },
  },
  roadmap: [
    {
      day: Number,
      title: String,
      category: {
        type: String,
        enum: ["DSA", "System Design", "Technical", "Behavioral", "Mock Interview", "Project Deep Dive", "Resume Refinement"],
        default: "Technical",
      },
      task: String,
      description: String,
      completed: { type: Boolean, default: false },
      resources: [
        {
          title: String,
          url: String,
          type: { type: String, default: "article" },
        }
      ],
    }
  ],
  readinessBreakdown: {
    technical: { type: Number, default: 65 },
    dsa: { type: Number, default: 60 },
    resume: { type: Number, default: 70 },
    communication: { type: Number, default: 68 },
    projects: { type: Number, default: 65 },
    behavioral: { type: Number, default: 70 },
    overall: { type: Number, default: 66 },
    lastDeltaExplanation: { type: String, default: "Baseline profile initialized. Complete your first mock interview and DSA test to boost readiness." },
  },
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
