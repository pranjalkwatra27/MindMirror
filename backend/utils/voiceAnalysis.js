const Sentiment = require("sentiment");

const sentiment = new Sentiment();

// Filler words detection
const FILLER_WORDS = [
  "uh", "um", "like", "you know", "basically", "actually", "literally",
  "i mean", "sort of", "kind of", "so like", "well", "I think", "I feel",
  "you see", "right", "okay", "so", "anyway", "also"
];

const analyzeFiller = (transcript) => {
  const lowerText = transcript.toLowerCase();
  let fillerCount = 0;
  const fillers = [];

  FILLER_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const matches = lowerText.match(regex);
    if (matches) {
      fillerCount += matches.length;
      fillers.push({ word, count: matches.length });
    }
  });

  const wordCount = transcript.split(/\s+/).length;
  const fillerPercentage = (fillerCount / wordCount) * 100;

  return {
    total_filler_words: fillerCount,
    filler_percentage: fillerPercentage.toFixed(2),
    breakdown: fillers.filter(f => f.count > 0),
    score: Math.max(0, 100 - (fillerPercentage * 2))
  };
};

const analyzeSpeakingSpeed = (transcript, durationSeconds) => {
  const wordCount = transcript.split(/\s+/).length;
  const wordsPerMinute = (wordCount / durationSeconds) * 60;

  let score = 100;
  if (wordsPerMinute < 80) {
    score = 60;
  } else if (wordsPerMinute > 200) {
    score = 70;
  } else if (wordsPerMinute >= 120 && wordsPerMinute <= 150) {
    score = 100;
  } else if (wordsPerMinute >= 100 && wordsPerMinute < 120) {
    score = 90;
  } else if (wordsPerMinute > 150 && wordsPerMinute <= 180) {
    score = 90;
  }

  const pace =
    wordsPerMinute < 80 ? "Too Slow" :
    wordsPerMinute > 200 ? "Too Fast" :
    (wordsPerMinute >= 120 && wordsPerMinute <= 150) ? "Ideal" :
    wordsPerMinute < 120 ? "Slightly Slow" : "Slightly Fast";

  return {
    words_per_minute: parseFloat(wordsPerMinute.toFixed(2)),
    word_count: wordCount,
    duration_seconds: durationSeconds,
    pace: pace,
    score: score
  };
};

const analyzeSentiment = (transcript) => {
  const result = sentiment.analyze(transcript);

  const confidenceKeywords = [
    "confident", "sure", "definitely", "absolutely", "clearly", "obviously",
    "strong", "excellent", "achieve", "delivered", "successfully", "expert",
    "proficient", "skilled", "experienced", "talented"
  ];

  const hesitationKeywords = [
    "maybe", "perhaps", "not sure", "unsure", "unclear", "difficult", "wrong",
    "confused", "stuck", "lost", "uncertain", "doubt", "problem"
  ];

  const lowerText = transcript.toLowerCase();

  let confidenceCount = 0;
  let hesitationCount = 0;

  confidenceKeywords.forEach(kw => {
    confidenceCount += (lowerText.match(new RegExp(`\\b${kw}\\b`, "gi")) || []).length;
  });

  hesitationKeywords.forEach(kw => {
    hesitationCount += (lowerText.match(new RegExp(`\\b${kw}\\b`, "gi")) || []).length;
  });

  let confidenceScore = 50 + (result.score * 2);
  confidenceScore += (confidenceCount * 3);
  confidenceScore -= (hesitationCount * 2);
  confidenceScore = Math.min(100, Math.max(0, confidenceScore));

  const label =
    confidenceScore >= 80 ? "Very Confident" :
    confidenceScore >= 65 ? "Confident" :
    confidenceScore >= 50 ? "Neutral" : "Hesitant";

  return {
    sentiment_score: result.score,
    comparative: result.comparative.toFixed(4),
    confidence_keywords: confidenceCount,
    hesitation_keywords: hesitationCount,
    confidence_score: parseFloat(confidenceScore.toFixed(2)),
    label: label
  };
};

const analyzePauses = (transcript, durationSeconds) => {
  const wordCount = transcript.split(/\s+/).length;
  const expectedDuration = (wordCount / 130) * 60;

  const pauseDuration = Math.max(0, durationSeconds - expectedDuration);
  const avgPauseFrequency = pauseDuration / (wordCount / 10);

  let clearanceScore = 100;
  if (pauseDuration > 10) clearanceScore -= 15;
  if (pauseDuration > 20) clearanceScore -= 20;
  if (avgPauseFrequency > 2) clearanceScore -= 10;

  return {
    estimated_pause_duration: pauseDuration.toFixed(2),
    pause_frequency: avgPauseFrequency.toFixed(2),
    score: Math.max(50, clearanceScore)
  };
};

const analyzeVoiceComplete = (transcript, durationSeconds) => {
  const fillerAnalysis = analyzeFiller(transcript);
  const speedAnalysis = analyzeSpeakingSpeed(transcript, durationSeconds);
  const sentimentAnalysis = analyzeSentiment(transcript);
  const pauseAnalysis = analyzePauses(transcript, durationSeconds);

  const clarityScore = (
    (100 - parseFloat(fillerAnalysis.filler_percentage)) * 0.4 +
    speedAnalysis.score * 0.3 +
    pauseAnalysis.score * 0.3
  ).toFixed(2);

  const confidenceScore = sentimentAnalysis.confidence_score;

  const suggestions = [];

  if (fillerAnalysis.total_filler_words > 10) {
    suggestions.push("Reduce filler words - practice speaking with intentional pauses instead.");
  }
  if (speedAnalysis.words_per_minute < 100) {
    suggestions.push("Speak faster - aim for 120-150 WPM for better engagement.");
  }
  if (speedAnalysis.words_per_minute > 180) {
    suggestions.push("Slow down your pace - speaking too fast reduces clarity.");
  }
  if (pauseAnalysis.estimated_pause_duration > 10) {
    suggestions.push("Avoid long pauses - maintain steady pacing throughout.");
  }
  if (confidenceScore < 70) {
    suggestions.push("Sound more confident - use stronger language and avoid hedging words.");
  }

  if (suggestions.length === 0) {
    suggestions.push("Excellent delivery! Clear, confident, and well-paced.");
  }

  return {
    filler_analysis: fillerAnalysis,
    speech_speed: speedAnalysis,
    sentiment_analysis: sentimentAnalysis,
    pause_analysis: pauseAnalysis,
    scores: {
      confidence_score: parseFloat(confidenceScore),
      clarity_score: parseFloat(clarityScore),
      overall_score: ((parseFloat(confidenceScore) + parseFloat(clarityScore)) / 2).toFixed(2)
    },
    suggestions: suggestions,
    transcript: transcript
  };
};

module.exports = {
  analyzeFiller,
  analyzeSpeakingSpeed,
  analyzeSentiment,
  analyzePauses,
  analyzeVoiceComplete
};
