const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const Resume = require("../models/Resume");
const User = require("../models/User");
const { callAI } = require("../utils/aiHelper");
const DemoDatabase = require("../utils/demoDatabase");
require("dotenv").config();

// Helper to check if using demo mode
const isMongoDBConnected = async () => {
  try {
    const mongoose = require("mongoose");
    return mongoose.connection.readyState === 1;
  } catch {
    return false;
  }
};

// Known technical skill catalogue for accurate local text parsing
const SKILL_CATALOGUE = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "Node.js", "Express",
  "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "C++", "C#", ".NET", "Go", "Rust",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "GraphQL", "REST APIs", "gRPC",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "GitHub", "Linux",
  "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Redux", "Zustand", "Jest", "Mocha", "Cypress",
  "Data Structures", "Algorithms", "System Design", "Microservices", "Kafka", "RabbitMQ", "Elasticsearch"
];

// Helper to parse resume text locally with deterministic metrics
const localDeterministicResumeParse = (extractedText) => {
  const textUpper = extractedText.toUpperCase();
  const textLower = extractedText.toLowerCase();

  // 1. Identify Skills
  const skillsFound = SKILL_CATALOGUE.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(extractedText);
  });

  // 2. Identify Experience Level & Domain
  let experienceLevel = "Fresher / Entry Level";
  if (textUpper.includes("SENIOR") || textUpper.includes("LEAD") || textUpper.includes("ARCHITECT") || textUpper.includes("5+ YEARS") || textUpper.includes("6+ YEARS")) {
    experienceLevel = "Senior Level";
  } else if (textUpper.includes("MID-LEVEL") || textUpper.includes("2+ YEARS") || textUpper.includes("3+ YEARS") || textUpper.includes("4+ YEARS")) {
    experienceLevel = "Mid-Level Engineer (2-4 YOE)";
  } else if (textUpper.includes("INTERN") || textUpper.includes("STUDENT") || textUpper.includes("GRADUATE") || textUpper.includes("BACHELOR") || textUpper.includes("B.TECH") || textUpper.includes("B.E.")) {
    experienceLevel = "Fresher / Graduate";
  }

  let primaryDomain = "Full-Stack Developer";
  const frontendKeywords = ["REACT", "FRONTEND", "VUE", "ANGULAR", "CSS", "TAILWIND", "NEXT.JS", "UI/UX"];
  const backendKeywords = ["NODE", "BACKEND", "EXPRESS", "DJANGO", "SPRING", "DATABASE", "POSTGRESQL", "MONGODB", "SQL", "FASTAPI"];
  const devopsKeywords = ["DOCKER", "KUBERNETES", "AWS", "CI/CD", "TERRAFORM", "LINUX", "DEVOPS"];

  const feCount = frontendKeywords.filter(k => textUpper.includes(k)).length;
  const beCount = backendKeywords.filter(k => textUpper.includes(k)).length;
  const doCount = devopsKeywords.filter(k => textUpper.includes(k)).length;

  if (doCount >= 3 && doCount > feCount) primaryDomain = "DevOps / Cloud Engineer";
  else if (feCount > beCount + 1) primaryDomain = "Frontend Developer";
  else if (beCount > feCount + 1) primaryDomain = "Backend Developer";
  else primaryDomain = "Full-Stack Developer";

  // 3. Metric & Impact Check
  const numbersFound = (extractedText.match(/\b\d+(\.\d+)?%?\b/g) || []).length;
  const metricPhrases = (extractedText.match(/(\d+%\s*(faster|reduction|increase|improvement|boost))|(\d+\+?\s*(users|requests|qps|ms|seconds|stars|downloads|clients))/gi) || []).length;
  const actionVerbsFound = (extractedText.match(/\b(architected|spearheaded|engineered|developed|implemented|optimized|designed|refactored|deployed|automated|reduced|increased)\b/gi) || []).length;

  // 4. Contact & Layout Presence
  const hasGithub = textLower.includes("github.com") || textLower.includes("github");
  const hasLinkedIn = textLower.includes("linkedin.com") || textLower.includes("linkedin");
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(extractedText);
  const hasProjects = textLower.includes("project") || textLower.includes("flagship") || textLower.includes("portfolio");

  // 5. Compute Detailed Scores
  const techDepthScore = Math.min(95, Math.max(45, 50 + skillsFound.length * 3));
  const impactScore = Math.min(95, Math.max(40, 45 + metricPhrases * 10 + Math.min(25, numbersFound * 2)));
  const clarityScore = Math.min(95, Math.max(50, 60 + (hasGithub ? 8 : 0) + (hasLinkedIn ? 8 : 0) + (hasEmail ? 8 : 0) + (actionVerbsFound > 5 ? 10 : 0)));
  const projectStrengthScore = Math.min(95, Math.max(45, (hasProjects ? 65 : 45) + (skillsFound.length > 5 ? 15 : 5)));
  const industryReadinessScore = Math.min(95, Math.max(40, Math.round((techDepthScore * 0.4) + (clarityScore * 0.3) + (impactScore * 0.3))));

  const overall = Math.round((techDepthScore * 0.25) + (impactScore * 0.25) + (clarityScore * 0.20) + (projectStrengthScore * 0.15) + (industryReadinessScore * 0.15));

  const mistakes = [];
  if (metricPhrases < 2) {
    mistakes.push({
      mistake: "Unquantified achievements in project descriptions",
      why_its_wrong: "Recruiters and ATS scorecards prioritize candidates who prove their impact with concrete metrics (e.g. latency reduced, user scale, efficiency boost).",
      how_to_correct: "Rewrite bullet points using: [Action Verb] + [Task] + [Measurable Result] (e.g., 'Optimized database queries, reducing API response time by 40% for 5k+ active users')."
    });
  }
  if (!hasGithub || !hasLinkedIn) {
    mistakes.push({
      mistake: "Missing clickable profile links (GitHub / LinkedIn / Portfolio)",
      why_its_wrong: "Technical hiring managers want to review your code commits, repositories, and professional network within 30 seconds.",
      how_to_correct: "Add direct hyperlinks to your active GitHub and LinkedIn profiles in the header section."
    });
  }
  if (skillsFound.length < 5) {
    mistakes.push({
      mistake: "Low technical keyword density for ATS filtering",
      why_its_wrong: "ATS algorithms search for specific frameworks, tools, and database systems before shortlisting for human review.",
      how_to_correct: "Include a dedicated 'Technical Skills' section categorizing Languages, Frameworks, Databases, and Developer Tools."
    });
  }
  if (actionVerbsFound < 4) {
    mistakes.push({
      mistake: "Passive language or weak action verbs in bullet points",
      why_its_wrong: "Phrases like 'Responsible for' or 'Helped with' diminish ownership and leadership presence.",
      how_to_correct: "Start every bullet with strong verbs: 'Architected', 'Spearheaded', 'Engineered', 'Optimized', or 'Automated'."
    });
  }

  return {
    candidate_profile: {
      primary_domain: primaryDomain,
      experience_level: experienceLevel,
      core_strength: `Demonstrated technical capability in ${skillsFound.slice(0, 4).join(", ") || "Core Software Engineering"} with clear project development experience.`
    },
    technical_skills: skillsFound.length > 0 ? skillsFound : ["JavaScript", "Python", "Data Structures", "Git", "REST APIs"],
    mistakes_found: mistakes.length > 0 ? mistakes : [
      {
        mistake: "Bullet point structure can be made more concise",
        why_its_wrong: "Long paragraphs are often skimmed over by technical recruiters.",
        how_to_correct: "Keep bullets under 2 lines using the STAR method (Situation, Task, Action, Result)."
      }
    ],
    perfect_score_roadmap: [
      "Incorporate at least 3 quantifiable business/technical metrics across your flagship projects",
      "Ensure your primary GitHub repositories have clean READMEs with architecture diagrams and live demo links",
      "Align section headers with standard ATS categories (Skills, Experience, Projects, Education)",
      "Add cloud and CI/CD tools (e.g. Docker, GitHub Actions, AWS) to enhance modern industry readiness"
    ],
    score_breakdown: {
      technical_depth: techDepthScore,
      impact: impactScore,
      clarity: clarityScore,
      project_strength: projectStrengthScore,
      industry_readiness: industryReadinessScore,
      overall_score: overall
    },
    recommended_roles: [
      primaryDomain,
      "Software Development Engineer",
      primaryDomain.includes("Frontend") ? "React Developer" : "Backend Systems Engineer"
    ],
    strengths: [
      `Solid foundation in ${skillsFound.slice(0, 3).join(", ") || "software fundamentals"}`,
      hasProjects ? "Clear project section showcasing applied engineering skills" : "Structured educational background and core technical aptitude"
    ]
  };
};

// Analyze Resume Endpoint
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file uploaded. Please upload a valid resume PDF." });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Parse PDF
    const parser = new PDFParse(new Uint8Array(fileBuffer));
    const pdfData = await parser.getText();
    const extractedText = (pdfData?.text || "").trim();

    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({ error: "Could not extract readable text from PDF. Ensure the file contains text and is not an image-only scan." });
    }

    // Call AI for Deep ATS Resume Evaluation
    const analysisPrompt = `
You are a senior technical recruiter, hiring manager, and ATS (Applicant Tracking System) evaluation algorithm.
Analyze this candidate's resume text thoroughly and objectively based ONLY on the actual content provided below:

--- RESUME TEXT START ---
${extractedText}
--- RESUME TEXT END ---

Perform a rigorous evaluation across:
1. Candidate Profile: primary domain, experience level, and exact core strengths demonstrated in the text.
2. Technical Skills: list only real skills, languages, frameworks, databases, and developer tools mentioned in the resume.
3. Specific Mistakes & Gaps: identify concrete weaknesses in THIS specific resume (missing metrics, vague descriptions, lack of links, weak action verbs, or formatting issues). For each, give the exact mistake, why ATS/recruiters reject it, and an explicit before/after correction.
4. Perfect Score Roadmap: 4 actionable steps specifically tailored for this candidate to achieve 95+ score.
5. Score Breakdown (0-100 integers):
   - technical_depth: breadth and modern relevance of tech stack
   - impact: quantifiable achievements, metrics (%, scale, latency, users)
   - clarity: bullet structure, readability, action verbs, contact links
   - project_strength: architectural complexity and uniqueness of projects
   - industry_readiness: alignment with modern production engineering practices (Git, Docker, CI/CD, testing)
   - overall_score: weighted composite score
6. Recommended Roles: 3 realistic job titles matching their exact stack.
7. Strengths: 2-3 genuine highlights from their resume.

Return ONLY valid JSON matching this exact structure with no markdown or formatting tags:
{
  "candidate_profile": {
    "primary_domain": "string",
    "experience_level": "string",
    "core_strength": "string"
  },
  "technical_skills": ["string"],
  "mistakes_found": [
    {
      "mistake": "string",
      "why_its_wrong": "string",
      "how_to_correct": "string"
    }
  ],
  "perfect_score_roadmap": ["string"],
  "score_breakdown": {
    "technical_depth": 75,
    "impact": 65,
    "clarity": 80,
    "project_strength": 70,
    "industry_readiness": 72,
    "overall_score": 73
  },
  "recommended_roles": ["string"],
  "strengths": ["string"]
}
`;

    let analysis;
    try {
      const analysisText = await callAI(analysisPrompt);
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid AI JSON structure");
      }
    } catch (error) {
      console.warn("AI Resume Analysis fallback activated:", error.message);
      analysis = localDeterministicResumeParse(extractedText);
    }

    // Ensure score breakdown is present and numeric
    if (!analysis.score_breakdown || typeof analysis.score_breakdown.overall_score !== "number") {
      const local = localDeterministicResumeParse(extractedText);
      analysis.score_breakdown = local.score_breakdown;
    }

    // Save Resume & Synchronize User Profile
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const resume = new Resume({
        userId: req.userId || null,
        originalText: extractedText,
        fileUrl: filePath,
        analysis: analysis,
        lastUpdated: new Date(),
      });
      await resume.save();

      // Synchronize with User profile
      if (req.userId) {
        const user = await User.findById(req.userId);
        if (user) {
          user.resumeId = resume._id;
          
          // Merge newly detected skills into user skills
          if (Array.isArray(analysis.technical_skills) && analysis.technical_skills.length > 0) {
            const currentSkills = new Set(user.skills || []);
            analysis.technical_skills.forEach(s => currentSkills.add(s));
            user.skills = Array.from(currentSkills);
          }

          // Update resume readiness score
          if (!user.readinessBreakdown) {
            user.readinessBreakdown = { technical: 65, dsa: 60, resume: 70, communication: 68, projects: 65, behavioral: 70, overall: 66 };
          }
          user.readinessBreakdown.resume = analysis.score_breakdown.overall_score;

          const b = user.readinessBreakdown;
          const newOverall = Math.round(
            (b.technical * 0.25) +
            (b.dsa * 0.20) +
            (b.resume * 0.20) +
            (b.communication * 0.15) +
            (b.projects * 0.10) +
            (b.behavioral * 0.10)
          );
          user.readinessBreakdown.overall = newOverall;
          user.readinessBreakdown.lastDeltaExplanation = `Resume evaluated with score of ${analysis.score_breakdown.overall_score}%. Placement readiness updated to ${newOverall}%.`;

          if (!user.progressMetrics) {
            user.progressMetrics = { totalInterviews: 0, averageConfidenceScore: 70, averageClarityScore: 70, placementReadinessScore: newOverall, weakAreas: [] };
          }
          user.progressMetrics.placementReadinessScore = newOverall;

          await user.save();
        }
      }

      return res.json({
        success: true,
        message: "Resume analyzed successfully and profile synchronized",
        analysis: analysis,
        resumeId: resume._id,
      });
    } else {
      // Demo Mode
      const resume = DemoDatabase.createResume({
        userId: req.userId || null,
        originalText: extractedText,
        fileUrl: filePath,
        analysis: analysis,
        lastUpdated: new Date(),
      });

      return res.json({
        success: true,
        message: "Resume analyzed successfully (Demo Mode)",
        analysis: analysis,
        resumeId: resume._id,
        mode: "demo",
      });
    }
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze resume",
      details: error.toString(),
    });
  }
};

// Get Existing Resume Analysis
const getResumeAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume analysis not found" });
      }

      return res.json({
        success: true,
        resume: resume,
      });
    } else {
      const resume = DemoDatabase.getResumeById(resumeId);
      return res.json({
        success: true,
        resume: resume || { _id: resumeId, analysis: localDeterministicResumeParse("Full Stack Developer Resume") },
        mode: "demo"
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Compare Resume and Job Description with Target Quiz & Roadmap
const compareJobDescription = async (req, res) => {
  try {
    const { jobDescription, resumeId } = req.body;

    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({ error: "Job description is required for matching." });
    }

    let resumeText = "";

    // 1. Get Resume Text from upload or database
    if (req.file) {
      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse(new Uint8Array(fileBuffer));
      const pdfData = await parser.getText();
      resumeText = (pdfData?.text || "").trim();
    } else if (resumeId) {
      const mongoConnected = await isMongoDBConnected();
      if (mongoConnected) {
        const resume = await Resume.findById(resumeId);
        if (resume) resumeText = resume.originalText;
      } else {
        const resume = DemoDatabase.getResumeById(resumeId);
        if (resume) resumeText = resume.originalText;
      }
    } else if (req.userId) {
      const mongoConnected = await isMongoDBConnected();
      if (mongoConnected) {
        const resume = await Resume.findOne({ userId: req.userId }).sort({ uploadedAt: -1 });
        if (resume) resumeText = resume.originalText;
      } else {
        const resume = DemoDatabase.getResumeByUserId(req.userId);
        if (resume) resumeText = resume.originalText;
      }
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return res.status(400).json({ error: "Could not find any resume text. Please upload your resume PDF first." });
    }

    // 2. Call AI for matching
    const matchPrompt = `
You are an expert ATS recruiter and technical hiring mentor.
Compare the candidate's Resume Text against the target Job Description below:

--- CANDIDATE RESUME ---
${resumeText}

--- TARGET JOB DESCRIPTION ---
${jobDescription}

Perform a rigorous match evaluation and return ONLY a valid JSON object matching this exact structure:
{
  "match_score": 75,
  "breakdown": {
    "skills_match": 72,
    "experience_match": 80,
    "formatting_score": 85
  },
  "matching_skills": ["Skill 1", "Skill 2"],
  "missing_skills": ["Missing Skill 1", "Missing Skill 2"],
  "recommended_resources": [
    {
      "skill": "Name of missing skill",
      "recommendation": "High quality course or guide title",
      "platform": "Coursera / Udemy / Official Documentation",
      "link": "https://www.coursera.org/search?query=skillname"
    }
  ],
  "quiz": [
    {
      "question": "Clear multiple-choice question testing the missing skill",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why Option A is correct",
      "topic": "Skill Name"
    }
  ]
}

Return ONLY valid JSON.`;

    let matchAnalysis;
    try {
      const matchText = await callAI(matchPrompt);
      const jsonMatch = matchText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        matchAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid AI match JSON");
      }
    } catch (err) {
      console.warn("AI Job Matching fallback activated:", err.message);
      
      const jdUpper = jobDescription.toUpperCase();
      const resUpper = resumeText.toUpperCase();

      const jdSkills = SKILL_CATALOGUE.filter(s => jdUpper.includes(s.toUpperCase()));
      const matchingSkills = jdSkills.filter(s => resUpper.includes(s.toUpperCase()));
      const missingSkills = jdSkills.filter(s => !resUpper.includes(s.toUpperCase()));

      const skillsMatchPct = jdSkills.length > 0 ? Math.round((matchingSkills.length / jdSkills.length) * 100) : 70;
      const overallMatch = Math.min(95, Math.max(35, Math.round((skillsMatchPct * 0.6) + 30)));

      matchAnalysis = {
        match_score: overallMatch,
        breakdown: {
          skills_match: skillsMatchPct,
          experience_match: 75,
          formatting_score: 82
        },
        matching_skills: matchingSkills.length > 0 ? matchingSkills : ["JavaScript", "HTML/CSS", "Git"],
        missing_skills: missingSkills.length > 0 ? missingSkills.slice(0, 4) : ["Docker", "TypeScript", "Redis"],
        recommended_resources: (missingSkills.length > 0 ? missingSkills.slice(0, 3) : ["Docker", "TypeScript"]).map(skill => ({
          skill,
          recommendation: `Mastering ${skill} for Production`,
          platform: "Udemy / Coursera",
          link: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`
        })),
        quiz: [
          {
            question: `What is the primary benefit of using ${(missingSkills[0] || "TypeScript")} in modern software development?`,
            options: [
              "It eliminates the need for unit tests completely",
              "It provides static type checking at compile time to prevent runtime errors",
              "It increases execution speed in the browser directly",
              "It replaces server-side databases"
            ],
            correct_answer: 1,
            explanation: "Static type safety catches errors during development before code reaches production.",
            topic: missingSkills[0] || "TypeScript"
          },
          {
            question: `How does ${(missingSkills[1] || "Docker")} assist in microservice deployments?`,
            options: [
              "By containerizing applications with all their dependencies for consistent environment execution",
              "By automatically writing SQL queries",
              "By replacing DNS servers",
              "By compiling JavaScript into machine code"
            ],
            correct_answer: 0,
            explanation: "Containers package code and dependencies together for reliable execution across development and production.",
            topic: missingSkills[1] || "Docker"
          }
        ]
      };
    }

    return res.json({
      success: true,
      match: matchAnalysis
    });
  } catch (error) {
    console.error("Compare Job Error:", error);
    res.status(500).json({ error: error.message || "Failed to compare job description" });
  }
};

module.exports = {
  analyzeResume,
  getResumeAnalysis,
  compareJobDescription,
};
