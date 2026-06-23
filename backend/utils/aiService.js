const { callAI } = require("./aiHelper");
require("dotenv").config();

// High-quality local fallbacks for interview questions
const defaultQuestionsMap = {
  HR: [
    { question: "Tell me about yourself and your professional background.", category: "General", difficulty: "Easy", expectedKeyPoints: ["Introduction", "Key experience", "Relevant skills"], tips: ["Keep it under 2 minutes", "Focus on achievements related to the target role"] },
    { question: "Why are you interested in this role and our company?", category: "Motivation", difficulty: "Easy", expectedKeyPoints: ["Company values", "Role alignment", "Career goals"], tips: ["Show genuine enthusiasm", "Mention specific company projects or values"] },
    { question: "Describe a challenging situation you faced in a project and how you resolved it.", category: "Behavioral", difficulty: "Medium", expectedKeyPoints: ["Situation", "Action taken", "Measurable result"], tips: ["Use the STAR method", "Highlight collaboration and problem-solving"] },
    { question: "How do you handle tight deadlines or pressure under stress?", category: "Behavioral", difficulty: "Medium", expectedKeyPoints: ["Prioritization", "Communication", "Mindfulness/stress management"], tips: ["Give a concrete past example", "Stay structured and positive"] },
    { question: "Where do you see yourself professionally in the next five years?", category: "Career Goals", difficulty: "Medium", expectedKeyPoints: ["Growth", "Commitment", "Skill development"], tips: ["Be realistic but ambitious", "Align your response with the role's growth path"] }
  ],
  Technical: [
    { question: "Explain the differences between SQL and NoSQL databases.", category: "Databases", difficulty: "Medium", expectedKeyPoints: ["Relational vs Non-relational", "Schema design", "Scaling (horizontal vs vertical)"], tips: ["Mention when to use which", "Discuss ACID compliance vs CAP theorem"] },
    { question: "How do WebSockets differ from traditional HTTP long polling?", category: "Networking", difficulty: "Medium", expectedKeyPoints: ["Duplex communication", "Connection overhead", "Real-time protocol"], tips: ["Explain the persistent handshake", "Give real-time chat or updates example"] },
    { question: "Describe the concept and core benefits of RESTful API design.", category: "API Design", difficulty: "Easy", expectedKeyPoints: ["Statelessness", "HTTP methods", "Resource-based URIs"], tips: ["Explain GET vs POST vs PUT vs DELETE", "Mention response status codes"] },
    { question: "What is system design scaling? Detail horizontal vs vertical scaling.", category: "System Design", difficulty: "Hard", expectedKeyPoints: ["Adding machines vs upgrading resources", "Load balancers", "Data replication"], tips: ["Address single points of failure", "Compare cost and database complexity"] },
    { question: "Detail how asynchronous execution works in JavaScript/Node.js.", category: "JavaScript", difficulty: "Medium", expectedKeyPoints: ["Event loop", "Call stack & Task queue", "Promises / Async-Await"], tips: ["Explain non-blocking I/O", "Differentiate microtasks and macrotasks"] }
  ],
  Behavioral: [
    { question: "Tell me about a time you had a conflict with a team member.", category: "Conflict Resolution", difficulty: "Hard", expectedKeyPoints: ["Empathy", "Private discussion", "Collaborative solution"], tips: ["Do not speak negatively of anyone", "Highlight the resolution and relationship preservation"] },
    { question: "Describe a project you worked on and are most proud of.", category: "Project Experience", difficulty: "Medium", expectedKeyPoints: ["Your role", "Technical challenges", "Project impact"], tips: ["Detail your specific contributions", "Quantify results where possible"] },
    { question: "Give an example of when you took ownership of a task outside your scope.", category: "Leadership", difficulty: "Hard", expectedKeyPoints: ["Proactiveness", "Problem discovery", "Taking responsibility"], tips: ["Show initiative", "Explain the positive outcome for the team"] },
    { question: "Explain a time when you made a mistake. How did you handle it?", category: "Accountability", difficulty: "Medium", expectedKeyPoints: ["Owning mistake", "Immediate communication", "Corrective action"], tips: ["Be honest", "Emphasize what you learned to prevent repetition"] },
    { question: "How do you keep your skills up to date with evolving tech trends?", category: "Learning Path", difficulty: "Easy", expectedKeyPoints: ["Personal projects", "Blogs/courses", "Tech community participation"], tips: ["Show passion for continuous learning", "Name specific resources you follow"] }
  ],
  "Rapid-Fire-DSA": [
    { question: "Explain the difference between a stack and a queue.", category: "Data Structures", difficulty: "Easy", expectedKeyPoints: ["LIFO vs FIFO", "Push/Pop vs Enqueue/Dequeue", "Time complexities"], tips: ["Mention real-world analogies", "Use call stack as stack example"] },
    { question: "Detail how a Hash Map resolves collisions.", category: "Data Structures", difficulty: "Medium", expectedKeyPoints: ["Chaining / Linked lists", "Open addressing / Probing", "Hash functions"], tips: ["Explain worst-case time complexity", "Discuss load factor"] },
    { question: "Explain the core concept of dynamic programming.", category: "Algorithms", difficulty: "Hard", expectedKeyPoints: ["Overlapping subproblems", "Optimal substructure", "Memoization / Tabulation"], tips: ["Contrast with divide-and-conquer", "Give Fibonacci or Knapsack example"] },
    { question: "What is binary search and its runtime complexity?", category: "Searching", difficulty: "Easy", expectedKeyPoints: ["Sorted array prerequisite", "Divide and conquer", "O(log N) time"], tips: ["Highlight search space reduction", "Write simple pseudo-code if asked"] },
    { question: "Describe how to detect a cycle in a Directed Graph.", category: "Algorithms", difficulty: "Hard", expectedKeyPoints: ["Depth First Search (DFS)", "Recursion stack tracking", "Kahn's algorithm / Indegree"], tips: ["Mention visited state representations", "Discuss topological sorting"] }
  ]
};

// Generate interview questions based on user profile and mode
const generateInterviewQuestions = async (userProfile, mode, count = 5) => {
  try {
    const skillsList = userProfile.skills?.join(", ") || "General";
    const roleLevel = userProfile.yearsOfExperience > 2 ? "experienced" : "junior";

    let prompt = `Generate ${count} professional ${mode} interview questions for a ${roleLevel} developer with skills: ${skillsList}.
    
For ${mode} mode:
- HR: Focus on communication, motivation, conflict resolution, career goals
- Technical: Focus on coding, system design, problem-solving for their tech stack
- Behavioral: Focus on past experiences, achievements, teamwork, challenges
- Rapid-Fire-DSA: Focus on quick DSA problems (arrays, strings, trees, recursion, DP)

Return ONLY a JSON array with this structure:
[
  {
    "question": "Your question here",
    "category": "Category name",
    "difficulty": "Easy/Medium/Hard",
    "expectedKeyPoints": ["point1", "point2"],
    "tips": ["tip1", "tip2"]
  }
]

Do not include markdown or explanations. Return valid JSON only.`;

    const text = await callAI(prompt);

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.warn("AI Service generateInterviewQuestions failed, using local fallback.", error.message);
    const defaults = defaultQuestionsMap[mode] || defaultQuestionsMap.HR;
    // Return a shuffled/selected subset matching count
    return defaults.slice(0, count);
  }
};

// Evaluate user answer
const evaluateAnswer = async (question, userAnswer, mode) => {
  try {
    const prompt = `Evaluate this interview answer on a scale of 0-100.

Question: ${question}
User's Answer: ${userAnswer}
Interview Mode: ${mode}

Consider:
- Completeness of answer
- Technical accuracy (if technical round)
- Communication clarity
- Relevance to question
- Confidence in answer

Return JSON format ONLY:
{
  "score": number,
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "feedback": "Brief constructive feedback",
  "keyPointsMissed": ["point1", "point2"]
}

Return valid JSON only, no markdown or explanations.`;

    const text = await callAI(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.warn("AI Service evaluateAnswer failed, using local fallback.", error.message);
    // Simple local evaluation logic based on length and common filler words
    const words = userAnswer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    
    let baseScore = 60;
    if (wordCount > 10) baseScore += 5;
    if (wordCount > 30) baseScore += 10;
    if (wordCount > 60) baseScore += 10;
    
    // Check for fillers
    const fillers = ["um", "uh", "like", "basically", "actually"];
    let fillerCount = 0;
    words.forEach(w => {
      if (fillers.includes(w.toLowerCase().replace(/[^a-zA-Z]/g, ""))) {
        fillerCount++;
      }
    });
    
    baseScore -= Math.min(15, fillerCount * 3);
    const score = Math.max(45, Math.min(95, baseScore));
    
    return {
      score: score,
      strengths: [
        wordCount > 30 ? "Good depth and elaborative detail" : "Concise response format",
        fillerCount < 2 ? "Strong confidence and minimal filler words" : "Shows active thought process"
      ],
      areasForImprovement: [
        wordCount < 20 ? "Try to elaborate more on your practical experiences" : "Structure your answer more systematically (e.g., STAR format)",
        fillerCount >= 2 ? "Reduce usage of verbal fillers like 'um' or 'like'" : "Include more concrete performance metrics"
      ],
      feedback: `You provided a reasonable response of ${wordCount} words. To improve, focus on structuring your answers systematically and giving measurable examples.`,
      keyPointsMissed: ["Specific quantifiable outcomes", "Alternative trade-off analysis"]
    };
  }
};

// Generate DSA weak areas suggestions
const generateDSAWeaknessList = async (interviewResults) => {
  try {
    const lowScoreQuestions = interviewResults.filter(q => q.score < 60);
    const topicsFromAnswers = lowScoreQuestions.map(q => q.category).join(", ");

    const prompt = `Based on these low-scoring DSA interview questions: ${topicsFromAnswers}
    
Generate a study roadmap with:
1. Specific topics to revise
2. Difficulty progression (Easy → Medium → Hard)
3. Estimated days to master each topic
4. Recommended resources

Return JSON format ONLY:
{
  "weakTopics": [
    {
      "topic": "Topic name",
      "difficulty": "Easy/Medium/Hard",
      "estimatedDays": number,
      "suggestedResources": ["resource1", "resource2"]
    }
  ],
  "studyPlan": "Brief study strategy"
}

Return valid JSON only.`;

    const text = await callAI(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.warn("AI Service generateDSAWeaknessList failed, using local fallback.", error.message);
    return {
      weakTopics: [
        {
          topic: "Dynamic Programming & Graph Algorithms",
          difficulty: "Medium",
          estimatedDays: 7,
          suggestedResources: ["LeetCode Study Plan", "GeeksforGeeks DSA Guide"]
        }
      ],
      studyPlan: "Dedicate 1-2 hours daily to practicing standard algorithms on trees, graphs, and dynamic programming."
    };
  }
};

// Generate placement readiness assessment
const generatePlacementReadiness = async (userMetrics) => {
  try {
    const prompt = `Based on these interview metrics, generate a placement readiness score:

Metrics:
- Average Confidence: ${userMetrics.avgConfidence}%
- Average Clarity: ${userMetrics.avgClarity}%
- Technical Accuracy: ${userMetrics.techAccuracy}%
- Total Interviews: ${userMetrics.totalInterviews}
- Weak Areas: ${userMetrics.weakAreas.join(", ")}

Return JSON format ONLY:
{
  "placementReadinessScore": number (0-100),
  "breakdown": {
    "technicalScore": number,
    "communicationScore": number,
    "behavioralScore": number,
    "dsaScore": number
  },
  "strengths": ["strength1", "strength2"],
  "criticalGaps": ["gap1", "gap2"],
  "recommendedNextSteps": ["step1", "step2"],
  "estimatedReadyDate": "timeframe description"
}

Return valid JSON only.`;

    const text = await callAI(prompt);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid response format");
  } catch (error) {
    console.warn("AI Service generatePlacementReadiness failed, using local fallback.", error.message);
    const avgConfidence = Number(userMetrics.avgConfidence) || 70;
    const avgClarity = Number(userMetrics.avgClarity) || 70;
    const techAccuracy = Number(userMetrics.techAccuracy) || 65;
    
    const calculatedScore = Math.round((avgConfidence * 0.3) + (avgClarity * 0.3) + (techAccuracy * 0.4));
    
    return {
      placementReadinessScore: calculatedScore,
      breakdown: {
        technicalScore: Math.round(techAccuracy),
        communicationScore: Math.round((avgConfidence + avgClarity) / 2),
        behavioralScore: Math.round(avgConfidence * 0.95),
        dsaScore: Math.round(techAccuracy * 0.9)
      },
      strengths: ["Clear response articulation", "Good presence of core technical terminology"],
      criticalGaps: ["Could improve structural responses in behavioral scenarios", "Revisit complex graph and dynamic programming questions"],
      recommendedNextSteps: ["Complete 3 more Mock Interviews", "Take the DSA Arrays and Strings quiz", "Optimize resume with quantitative impact metrics"],
      estimatedReadyDate: "1-2 weeks of consistent preparation"
    };
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  generateDSAWeaknessList,
  generatePlacementReadiness
};
