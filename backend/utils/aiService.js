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

// Generate Advanced Day-by-Day Adaptive Roadmap
const generateRoadmapPlan = async ({
  targetRole = "Full-Stack Developer",
  targetCompany = "Top Tech",
  targetDays = 21,
  currentReadiness = 65,
  skills = [],
  weakTopics = [],
  experienceYears = 0
}) => {
  try {
    const prompt = `Create a realistic, dynamic, day-by-day placement preparation roadmap for a candidate:
Target Role: ${targetRole}
Target Company: ${targetCompany}
Days Remaining: ${targetDays} days
Current Readiness: ${currentReadiness}%
Known Skills: ${skills.join(", ") || "Web development fundamentals, Data Structures"}
Weak Areas needing revision: ${weakTopics.map(w => typeof w === 'string' ? w : w.topic).join(", ") || "Graph algorithms, System Design scaling, Behavioral STAR structure"}
Experience: ${experienceYears} years

Generate a ${Math.min(targetDays, 30)}-day roadmap with structured daily tasks covering DSA, System Design/Technical depth, Project Deep Dives, Mock Interviews, and Behavioral revision.

Return ONLY a JSON array of days matching this structure:
[
  {
    "day": 1,
    "title": "Topic or Milestone Title",
    "category": "DSA" | "Technical" | "Project Deep Dive" | "Mock Interview" | "Behavioral" | "System Design" | "Resume Refinement",
    "task": "Concrete task (e.g., Solve 2 LeetCode Two Pointers problems + revise Arrays)",
    "description": "Short explanation of why this is important for ${targetCompany} and key concepts to master.",
    "resources": [
      {
        "title": "Resource Name",
        "url": "https://leetcode.com or https://developer.mozilla.org",
        "type": "practice" | "video" | "article"
      }
    ]
  }
]

Return valid JSON array only.`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid roadmap JSON");
  } catch (error) {
    console.warn("AI Service generateRoadmapPlan failed, using intelligent default generator.", error.message);
    const days = Math.min(targetDays || 21, 30);
    const generated = [];
    const categories = ["DSA", "Technical", "Project Deep Dive", "Mock Interview", "Behavioral", "System Design"];
    
    for (let i = 1; i <= days; i++) {
      let cat = categories[(i - 1) % categories.length];
      if (i === 1) cat = "DSA";
      if (i === days) cat = "Mock Interview";

      let taskTitle = "";
      let taskDesc = "";
      let taskDetail = "";
      let resList = [{ title: `${targetCompany} Prep Guide`, url: "https://leetcode.com", type: "practice" }];

      switch (cat) {
        case "DSA":
          taskTitle = `Master ${weakTopics[0]?.topic || "Arrays & Hashing"} + 2 Practice Problems`;
          taskDetail = "Solve 2 LeetCode problems (1 Medium, 1 Easy) focusing on optimal time & space complexity.";
          taskDesc = "Focus on space-time trade-offs and edge cases commonly asked in online assessments.";
          resList = [
            { title: "LeetCode Top 75 DSA", url: "https://leetcode.com/problemset/all/", type: "practice" },
            { title: "Visualgo Algorithm Visualizer", url: "https://visualgo.net", type: "article" }
          ];
          break;
        case "Technical":
          taskTitle = `${targetRole} Core Architecture & Asynchronous Patterns`;
          taskDetail = "Revise closures, event loop, API caching, and database indexing mechanisms.";
          taskDesc = "Ensure you can explain internal workings, not just surface-level syntax.";
          resList = [{ title: "MDN Web Engineering Docs", url: "https://developer.mozilla.org", type: "article" }];
          break;
        case "Project Deep Dive":
          taskTitle = "Project Cross-Examination & Architecture Justification";
          taskDetail = "Formulate 5 deep-dive technical questions about your flagship project architecture.";
          taskDesc = "Practice explaining trade-offs: why this database? How would you handle 10x traffic?";
          break;
        case "Mock Interview":
          taskTitle = `Full AI Mock Interview Simulation for ${targetCompany}`;
          taskDetail = `Complete a 5-question ${cat} session on MindMirror and review your STAR scores.`;
          taskDesc = "Maintain vocal clarity, limit filler words, and keep responses under 2 minutes.";
          break;
        case "Behavioral":
          taskTitle = "STAR Method Stories (Leadership, Conflict, Failure)";
          taskDetail = "Write out 3 structured STAR stories highlighting measurable business or technical impact.";
          taskDesc = "Situation, Task, Action (what you specifically did), Result (quantified metrics).";
          break;
        default:
          taskTitle = "High-Level System Design & Scaling Principles";
          taskDetail = "Study load balancing, database sharding, caching strategies (Redis/CDN).";
          taskDesc = "Key foundation for tech rounds at top product companies.";
      }

      generated.push({
        day: i,
        title: taskTitle,
        category: cat,
        task: taskDetail,
        description: taskDesc,
        completed: false,
        resources: resList
      });
    }
    return generated;
  }
};

// Generate Conversational Follow-Up Questions (AI Memory + Dynamic Context)
const generateFollowUpQuestion = async ({
  previousQuestion,
  candidateAnswer,
  candidateMemory = {},
  mode = "Technical",
  currentDifficulty = "Medium"
}) => {
  try {
    const prompt = `You are a strict yet constructive senior tech interviewer at a top company.
The candidate just answered your question:

Previous Question: "${previousQuestion}"
Candidate Answer: "${candidateAnswer}"
Interview Mode: ${mode}
Current Difficulty: ${currentDifficulty}
Candidate Weak Areas / Background: ${JSON.stringify(candidateMemory?.weakDSATopics || [])}

Generate an intelligent follow-up question that:
1. Drills into specific details they mentioned (e.g. choice of tools, architecture, time complexity, or edge cases).
2. Challenges their assumptions or asks what happens if constraints change (e.g. 100x traffic, distributed systems, memory limits).
3. If they gave a vague answer, asks for a concrete example or code structure.

Return ONLY a JSON object:
{
  "followUpQuestion": "The direct question text",
  "category": "Deep Dive / Architecture / Edge Case / Behavioral Probing",
  "difficulty": "Easy" | "Medium" | "Hard",
  "rationale": "Why the interviewer asked this follow up based on their answer",
  "tips": ["Tip 1", "Tip 2"]
}

Return valid JSON only.`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid follow-up JSON");
  } catch (error) {
    console.warn("AI Service generateFollowUpQuestion fallback.", error.message);
    const words = candidateAnswer.toLowerCase();
    let followUp = "Can you walk me through the trade-offs of that approach versus an alternative solution?";
    if (words.includes("database") || words.includes("sql") || words.includes("mongo")) {
      followUp = "You mentioned data persistence. How would your schema and indexing handle sudden query spikes?";
    } else if (words.includes("react") || words.includes("frontend") || words.includes("api")) {
      followUp = "How would you optimize the rendering performance and state management in this scenario?";
    } else if (mode === "Behavioral") {
      followUp = "What was the single biggest obstacle you personally overcame in that situation, and what would you do differently today?";
    }

    return {
      followUpQuestion: followUp,
      category: "Architecture & Trade-offs",
      difficulty: "Medium",
      rationale: "Probing deeper into architectural justifications and alternatives.",
      tips: ["Structure your answer with clear trade-offs (Pros vs Cons)", "Cite real-world performance metrics if possible"]
    };
  }
};

// Evaluate Answer with STAR & Multi-dimensional Quality Metrics
const evaluateAnswerWithSTAR = async (question, userAnswer, mode = "Technical") => {
  try {
    const prompt = `Evaluate this interview response with granular multi-dimensional scoring:

Question: "${question}"
Candidate Answer: "${userAnswer}"
Mode: ${mode}

Evaluate across:
1. Relevance (0-100): Did they directly answer the core prompt?
2. Structure (0-100): Did they use clear structure (e.g. STAR: Situation, Task, Action, Result)?
3. Technical Depth (0-100): Concrete technical accuracy, trade-offs, terminology.
4. Confidence (0-100): Assertive, decisive, lack of hesitation.
5. Conciseness (0-100): Direct without rambling.

Return ONLY a JSON object:
{
  "overallScore": number,
  "dimensions": {
    "relevance": number,
    "structure": number,
    "technicalDepth": number,
    "confidence": number,
    "conciseness": number
  },
  "starChecklist": {
    "answeredQuestion": boolean,
    "gaveConcreteExample": boolean,
    "explainedReasoning": boolean,
    "mentionedMeasurableImpact": boolean,
    "structuredWell": boolean
  },
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1", "area2"],
  "idealAnswerSnippet": "A 2-3 sentence example of how an exemplary candidate would formulate this answer",
  "feedback": "Constructive 2-3 sentence coaching summary"
}

Return valid JSON only.`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid STAR evaluation JSON");
  } catch (error) {
    console.warn("AI Service evaluateAnswerWithSTAR fallback.", error.message);
    const words = (userAnswer || "").trim().split(/\s+/).filter(Boolean);
    const len = words.length;
    const hasNumbers = /\d+/.test(userAnswer);
    const hasTechnicalTerms = /(api|database|react|node|algorithm|complexity|scale|performance|cache|component)/i.test(userAnswer);

    const relevance = Math.min(95, Math.max(50, len > 15 ? 80 : 55));
    const structure = Math.min(90, Math.max(45, len > 40 ? 82 : 60));
    const technicalDepth = hasTechnicalTerms ? 85 : 62;
    const confidence = Math.min(92, Math.max(55, 75 + (len > 30 ? 10 : 0)));
    const conciseness = len > 150 ? 55 : (len > 25 ? 85 : 70);

    const overall = Math.round((relevance * 0.25) + (structure * 0.2) + (technicalDepth * 0.25) + (confidence * 0.15) + (conciseness * 0.15));

    return {
      overallScore: overall,
      dimensions: {
        relevance,
        structure,
        technicalDepth,
        confidence,
        conciseness
      },
      starChecklist: {
        answeredQuestion: len > 10,
        gaveConcreteExample: len > 35,
        explainedReasoning: len > 20,
        mentionedMeasurableImpact: hasNumbers,
        structuredWell: len > 30
      },
      strengths: [
        len > 30 ? "Good descriptive depth and practical terminology" : "Direct response approach",
        hasTechnicalTerms ? "Used relevant engineering concepts" : "Clear communication flow"
      ],
      areasForImprovement: [
        !hasNumbers ? "Quantify your achievements with numbers, % improvements, or latency metrics" : "Structure with STAR format (Situation -> Task -> Action -> Result)",
        len < 25 ? "Provide more context and explain your reasoning steps" : "Ensure you summarize the bottom-line outcome clearly"
      ],
      idealAnswerSnippet: "When building our service, we identified a 300ms bottleneck in query latency. I redesigned our caching tier using Redis with LRU eviction, which reduced response times by 65% across 50k daily active users.",
      feedback: `Solid attempt with an overall score of ${overall}%. Focus on highlighting measurable results and concrete architectural choices.`
    };
  }
};

// Generate Company-Specific Preparation Packs
const generateCompanyPrepPack = async (companyName = "Google", role = "Software Engineer", experienceLevel = "Fresher") => {
  try {
    const prompt = `Generate a comprehensive, company-specific interview preparation pack for:
Company: ${companyName}
Target Role: ${role}
Experience: ${experienceLevel}

Include:
1. Expected interview rounds (e.g. OA, DSA, System Design, Leadership/Googliness/Bar Raiser)
2. Most tested DSA topics & difficulty breakdown
3. Top 5 company-specific technical & behavioral questions
4. Resume keywords preferred by their ATS
5. Culture principles and key interview tips

Return ONLY a JSON object:
{
  "company": "${companyName}",
  "role": "${role}",
  "difficultyLevel": "Medium-Hard",
  "hiringBarDescription": "Brief summary of their interview philosophy",
  "rounds": [
    {
      "roundNumber": 1,
      "title": "Online Assessment (OA)",
      "focus": "DSA & Problem Solving",
      "duration": "60-90 mins",
      "topics": ["Arrays", "Graphs", "Dynamic Programming"]
    }
  ],
  "dsaTopicWeightage": [
    { "topic": "Dynamic Programming", "weightage": 30, "difficulty": "Medium-Hard" },
    { "topic": "Trees & Graphs", "weightage": 30, "difficulty": "Medium" },
    { "topic": "Arrays & Strings", "weightage": 25, "difficulty": "Medium" },
    { "topic": "System Design Basics", "weightage": 15, "difficulty": "Medium" }
  ],
  "curatedQuestions": [
    {
      "type": "Technical",
      "question": "Question text",
      "importance": "High",
      "tips": "What the interviewer looks for"
    }
  ],
  "resumeKeywords": ["Distributed Systems", "Cloud", "Clean Architecture", "Microservices"],
  "culturePrinciples": ["Customer Obsession / Leadership Principles / Innovation"]
}

Return valid JSON only.`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid company prep pack JSON");
  } catch (error) {
    console.warn("AI Service generateCompanyPrepPack fallback.", error.message);
    return {
      company: companyName,
      role: role,
      difficultyLevel: companyName.toLowerCase().includes("google") || companyName.toLowerCase().includes("amazon") ? "Hard" : "Medium",
      hiringBarDescription: `${companyName} focuses heavily on structured problem solving, clean code quality, scalability mindset, and cultural alignment.`,
      rounds: [
        { roundNumber: 1, title: "Online Coding Assessment", focus: "DSA & Algorithmic Puzzles", duration: "75 mins", topics: ["Arrays", "Strings", "Prefix Sums"] },
        { roundNumber: 2, title: "Technical Round 1 (DSA & Core)", focus: "Trees, Graphs, Recursion", duration: "45-60 mins", topics: ["DFS/BFS", "Binary Trees", "HashMaps"] },
        { roundNumber: 3, title: "Technical Round 2 (System & Projects)", focus: "Project Deep Dive & Architecture", duration: "45-60 mins", topics: ["REST APIs", "Database Schema", "Caching"] },
        { roundNumber: 4, title: "HR & Behavioral Round", focus: "Culture Fit & STAR Questions", duration: "30-45 mins", topics: ["Leadership", "Team Conflict", "Ownership"] }
      ],
      dsaTopicWeightage: [
        { topic: "Arrays & Strings", weightage: 30, difficulty: "Medium" },
        { topic: "Trees & Graphs", weightage: 30, difficulty: "Medium-Hard" },
        { topic: "Dynamic Programming", weightage: 20, difficulty: "Medium-Hard" },
        { topic: "Hash Tables & Stacks", weightage: 20, difficulty: "Medium" }
      ],
      curatedQuestions: [
        { type: "Technical", question: `Design an efficient LRU Cache or Rate Limiter in your preferred language.`, importance: "High", tips: "Discuss hash map + doubly linked list trade-offs and thread safety." },
        { type: "Technical", question: `How would you diagnose and fix a slow query or memory leak in production?`, importance: "High", tips: "Mention profiling tools, query execution plans (EXPLAIN), and heap dumps." },
        { type: "Behavioral", question: `Tell me about a time you disagreed with a technical decision made by a team member.`, importance: "Very High", tips: "Focus on data-backed discussions, respectful dissent, and committed alignment." }
      ],
      resumeKeywords: ["High Availability", "REST APIs", "Unit Testing", "CI/CD", "Data Structures", "Docker", "Database Optimization"],
      culturePrinciples: ["Customer Focus", "Deliver Results", "Invent & Simplify", "Ownership"]
    };
  }
};

// Generate Project Deep Dive Questions
const generateProjectDeepDiveQuestions = async (projectTitle = "Flagship Project", description = "", techStack = []) => {
  try {
    const prompt = `Generate 5 deep-dive technical cross-examination questions for a candidate's resume project:
Project Title: ${projectTitle}
Description: ${description}
Tech Stack: ${techStack.join(", ")}

Generate questions in these 5 categories:
1. Basic Architectural Choice (Why this stack?)
2. Technical Mechanics (How does your core feature work under the hood?)
3. 10x Scale & Stress Test (What breaks if users grow by 100x?)
4. Cross-Questioning (Why didn't you use alternative technology X?)
5. Failure & Bottleneck (What was the biggest bug or technical failure?)

Return ONLY a JSON array:
[
  {
    "category": "Basic / Technical / Scale / Cross-Question / Failure",
    "question": "Question text",
    "expectedAnswerKeyPoints": ["Point 1", "Point 2"],
    "tips": "Interviewer advice"
  }
]

Return valid JSON only.`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid project questions JSON");
  } catch (error) {
    console.warn("AI Service generateProjectDeepDiveQuestions fallback.", error.message);
    return [
      { category: "Basic", question: `Why did you choose ${techStack[0] || 'Node.js/React'} for ${projectTitle} over other modern frameworks?`, expectedAnswerKeyPoints: ["Ecosystem", "Developer productivity", "Performance benchmarks"], tips: "State concrete trade-offs, not just 'it was easy to learn'." },
      { category: "Cross-Question", question: `Why did you choose your current persistence layer instead of an event-driven or in-memory architecture?`, expectedAnswerKeyPoints: ["Data consistency", "Query flexibility", "Cost efficiency"], tips: "Acknowledge when the alternative could be better." },
      { category: "Failure", question: `What was the most challenging technical roadblock you encountered while building ${projectTitle}, and how did you resolve it?`, expectedAnswerKeyPoints: ["Root cause analysis", "Debugging steps", "Post-mortem prevention"], tips: "Own the problem and highlight what you learned." }
    ];
  }
};

// Generate Placement Readiness Breakdown
const generatePlacementReadiness = async (metrics = {}) => {
  try {
    const prompt = `Based on candidate's performance metrics:
${JSON.stringify(metrics, null, 2)}

Generate a detailed Placement Readiness Assessment with:
1. Overall placement readiness score (0-100)
2. Breakdown scores: technicalScore, communicationScore, behavioralScore, dsaScore (0-100)
3. Strengths and top areas of improvement
4. Role prediction readiness (e.g. "Ready for Entry Level", "Ready for Mid-Level", "Needs Improvement")
5. Actionable preparation recommendations

Return JSON format ONLY:
{
  "placementReadinessScore": number,
  "breakdown": {
    "technicalScore": number,
    "communicationScore": number,
    "behavioralScore": number,
    "dsaScore": number
  },
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendations": ["rec1", "rec2"],
  "predictedRoleReadiness": "string"
}

Return valid JSON only.`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Invalid placement readiness JSON");
  } catch (error) {
    console.warn("AI Service generatePlacementReadiness fallback.", error.message);
    const conf = metrics.avgConfidence || metrics.confidenceScore || 70;
    const clar = metrics.avgClarity || metrics.clarityScore || 72;
    const tech = metrics.techAccuracy || 70;
    const dsa = 68;
    const behavioral = Math.round((conf + clar) / 2);
    const overall = Math.round((tech * 0.35) + (dsa * 0.25) + (clar * 0.2) + (conf * 0.2));

    return {
      placementReadinessScore: Math.min(100, Math.max(20, overall)),
      breakdown: {
        technicalScore: Math.min(100, Math.max(30, Math.round(tech))),
        communicationScore: Math.min(100, Math.max(30, Math.round(clar))),
        behavioralScore: Math.min(100, Math.max(30, Math.round(behavioral))),
        dsaScore: Math.min(100, Math.max(30, Math.round(dsa)))
      },
      strengths: ["Clear communication flow", "Good foundational problem-solving approach"],
      weaknesses: ["Deep-dive system design trade-offs", "Time management during coding rounds"],
      recommendations: [
        "Practice 2-3 medium LeetCode problems daily",
        "Structure behavioral answers using the STAR method",
        "Review asynchronous architecture and database indexing"
      ],
      predictedRoleReadiness: overall > 75 ? "Ready for SDE-1 / Associate Engineer Roles" : "Candidate for SDE Intern / Junior Engineer with Mentorship"
    };
  }
};

// Generate Dynamic DSA Multiple-Choice Questions using AI (Local LLM / Cloud Gemini)
const generateDSAQuestionsAI = async ({ topic = "Mixed", difficulty = "Medium", count = 10, language = "General" }) => {
  try {
    const prompt = `Generate ${count} high-quality, authentic technical Data Structures & Algorithms multiple-choice questions (MCQs) for interview preparation.
Topic: ${topic}
Difficulty: ${difficulty}
Language Context: ${language}

For each question, provide:
1. "id": unique string (e.g. "ai-dsa-1")
2. "topic": topic category (e.g. Arrays, Linked List, Stacks, Trees, Dynamic Programming, Graphs, Sorting)
3. "difficulty": "Easy" | "Medium" | "Hard"
4. "company": FAANG/Top Tech company name (e.g. Google, Amazon, Meta, Microsoft, Apple, Uber, Netflix)
5. "question": clear problem statement or complexity question
6. "options": array of exactly 4 distinct string choices
7. "answer": 0-indexed integer (0, 1, 2, or 3) indicating the correct option
8. "explanation": detailed explanation covering optimal approach and time/space complexity analysis

Return ONLY a valid JSON array of question objects matching this schema:
[
  {
    "id": "ai-dsa-1",
    "topic": "${topic === 'Mixed' ? 'Arrays' : topic}",
    "difficulty": "${difficulty === 'Mixed' ? 'Medium' : difficulty}",
    "company": "Google",
    "question": "What is the optimal time complexity to find the median in a data stream of n integers?",
    "options": ["O(n log n)", "O(log n) per insertion with two heaps", "O(1) insertion, O(n) median", "O(n) per insertion"],
    "answer": 1,
    "explanation": "Using a max-heap for lower half and min-heap for upper half achieves O(log n) insertion and O(1) median retrieval."
  }
]

Return valid JSON array only, without markdown formatting or introductory text.`;

    const text = await callAI(prompt);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          id: q.id || `ai-${(topic || 'dsa').toLowerCase().replace(/\s+/g, '-')}-${idx + 1}-${Date.now()}`,
          topic: q.topic || topic,
          difficulty: q.difficulty || difficulty,
          company: q.company || "Top Tech",
          question: q.question,
          options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
          answer: typeof q.answer === 'number' && q.answer >= 0 && q.answer < 4 ? q.answer : 0,
          explanation: q.explanation || "Optimal solution time and space complexity breakdown."
        }));
      }
    }
    throw new Error("Invalid question format received from AI");
  } catch (error) {
    console.warn("generateDSAQuestionsAI fallback to curated question bank:", error.message);
    return null;
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
  evaluateAnswerWithSTAR,
  generateFollowUpQuestion,
  generateDSAWeaknessList,
  generatePlacementReadiness,
  generateRoadmapPlan,
  generateCompanyPrepPack,
  generateProjectDeepDiveQuestions,
  generateDSAQuestionsAI
};


