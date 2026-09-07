const Interview = require("../models/Interview");
const User = require("../models/User");
const Progress = require("../models/Progress");
const DemoDatabase = require("../utils/demoDatabase");
const { analyzeVoiceComplete } = require("../utils/voiceAnalysis");

// Helper to check if using demo mode
const isMongoDBConnected = async () => {
  try {
    const mongoose = require("mongoose");
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Analyze Voice
const analyzeVoice = async (req, res) => {
  try {
    const { interviewId, transcript, duration } = req.body;
    const userId = req.userId;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: "Transcript is required" });
    }

    if (!duration || duration <= 0) {
      return res.status(400).json({ error: "Valid duration is required" });
    }

    // Perform voice analysis
    const voiceAnalysis = analyzeVoiceComplete(transcript, duration);

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // MongoDB mode
      // If interviewId provided, update interview with voice analysis
      if (interviewId) {
        const interview = await Interview.findById(interviewId);
        if (interview) {
          interview.voiceAnalysis = {
            fillerWords: voiceAnalysis.filler_analysis,
            speakingSpeed: voiceAnalysis.speech_speed,
            sentiment: voiceAnalysis.sentiment_analysis,
            pauses: voiceAnalysis.pause_analysis,
          };

          interview.scores = {
            ...interview.scores,
            confidenceScore: voiceAnalysis.scores.confidence_score,
            clarityScore: voiceAnalysis.scores.clarity_score,
            overallScore: voiceAnalysis.scores.overall_score,
          };

          await interview.save();

          // Update user progress
          const user = await User.findById(userId);
          if (user) {
            if (!user.progressMetrics) {
              user.progressMetrics = { totalInterviews: 0, averageConfidenceScore: 0, averageClarityScore: 0, weakAreas: [], strongAreas: [], placementReadinessScore: 0 };
            }
            const count = Math.max(1, user.progressMetrics.totalInterviews || 1);
            user.progressMetrics.averageClarityScore =
              ((user.progressMetrics.averageClarityScore || 70) * (count - 1) +
                voiceAnalysis.scores.clarity_score) / count;

            await user.save();
          }
        }
      }

      return res.json({
        success: true,
        analysis: {
          scores: voiceAnalysis.scores,
          filler_analysis: voiceAnalysis.filler_analysis,
          speech_speed: voiceAnalysis.speech_speed,
          sentiment_analysis: voiceAnalysis.sentiment_analysis,
          pause_analysis: voiceAnalysis.pause_analysis,
          suggestions: voiceAnalysis.suggestions,
          transcript: voiceAnalysis.transcript,
        },
        message: "Voice analysis completed (MongoDB)",
      });
    } else {
      // Demo mode
      return res.json({
        success: true,
        mode: "demo",
        analysis: {
          scores: voiceAnalysis.scores,
          filler_analysis: voiceAnalysis.filler_analysis,
          speech_speed: voiceAnalysis.speech_speed,
          sentiment_analysis: voiceAnalysis.sentiment_analysis,
          pause_analysis: voiceAnalysis.pause_analysis,
          suggestions: voiceAnalysis.suggestions,
          transcript: voiceAnalysis.transcript,
        },
        message: "Voice analysis completed (Demo Mode)",
      });
    }
  } catch (error) {
    console.error("Voice Analysis Error:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  analyzeVoice,
};
