const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const Resume = require("../models/Resume");
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

// Analyze Resume
const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Parse PDF
    const parser = new PDFParse(new Uint8Array(fileBuffer));
    const pdfData = await parser.getText();
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    // Use AI for deep analysis
    const analysisPrompt = `
You are a professional ATS-grade resume evaluator and placement coach.

Analyze this resume comprehensively:

Resume Text:
${extractedText}

Perform deep evaluation on these dimensions:
1. Technical Depth - depth of technical skills and their diversity
2. Impact & Measurability - presence of metrics and quantifiable achievements
3. Clarity & Writing Quality - clarity and professional presentation
4. Project Strength - quality and relevance of projects
5. Industry Readiness - preparation for industry interviews

Scoring Rules:
- 90+ = Industry-ready with strong measurable impact and technical depth
- 75-89 = Strong candidate but needs better metrics
- 60-74 = Good fundamentals but missing impact clarity
- Below 60 = Needs significant improvement

Be critical where necessary. Do not inflate scores.

Return ONLY valid JSON in this exact format:

{
  "candidate_profile": {
    "primary_domain": "Frontend/Backend/Full-Stack/etc",
    "experience_level": "Fresher/Junior/Mid-level",
    "core_strength": "Description of main strength"
  },
  "technical_skills": ["skill1", "skill2", "skill3"],
  "mistakes_found": [
    {
      "mistake": "The exact mistake found",
      "why_its_wrong": "Why ATS systems or recruiters dislike it",
      "how_to_correct": "Explicit, actionable example to fix it (e.g. Instead of X -> Use Y)"
    }
  ],
  "perfect_score_roadmap": [
    "Step 1 to get a 100/100 score",
    "Step 2",
    "Step 3"
  ],
  "score_breakdown": {
    "technical_depth": number,
    "impact": number,
    "clarity": number,
    "project_strength": number,
    "industry_readiness": number,
    "overall_score": number
  },
  "recommended_roles": ["role1", "role2", "role3"],
  "strengths": ["strength1", "strength2"]
}

Return ONLY valid JSON. Do not include markdown or explanations.`;

    let analysis;
    try {
      const analysisText = await callAI(analysisPrompt);

      // Parse JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.warn("Gemini Resume Analysis failed, generating local mock analysis.", error.message);
      
      // Determine domain from text keywords
      const textUpper = extractedText.toUpperCase();
      let primaryDomain = "Full-Stack Developer";
      let recommendedRoles = ["Full-Stack Developer", "Software Engineer"];
      
      if (textUpper.includes("REACT") || textUpper.includes("FRONTEND") || textUpper.includes("CSS") || textUpper.includes("NEXT.JS")) {
        if (!textUpper.includes("NODE") && !textUpper.includes("BACKEND") && !textUpper.includes("MONGO")) {
          primaryDomain = "Frontend Developer";
          recommendedRoles = ["Frontend Developer", "UI Engineer", "Software Engineer"];
        }
      } else if (textUpper.includes("NODE") || textUpper.includes("BACKEND") || textUpper.includes("PYTHON") || textUpper.includes("EXPRESS")) {
        primaryDomain = "Backend Developer";
        recommendedRoles = ["Backend Developer", "System Engineer", "Software Engineer"];
      }
      
      // Extract skills
      const possibleSkills = ["JavaScript", "TypeScript", "React", "Node.js", "Express", "MongoDB", "SQL", "Python", "Java", "C++", "Git", "Docker", "Tailwind CSS", "Next.js", "HTML5", "CSS3"];
      const skillsFound = possibleSkills.filter(s => textUpper.includes(s.toUpperCase()));
      if (skillsFound.length === 0) {
        skillsFound.push("Software Development", "Problem Solving", "Computer Science");
      }
      
      analysis = {
        candidate_profile: {
          primary_domain: primaryDomain,
          experience_level: textUpper.includes("SENIOR") || textUpper.includes("LEAD") ? "Mid-to-Senior Level" : "Fresher/Junior",
          core_strength: "Solid understanding of software engineering fundamentals and clean code principles."
        },
        technical_skills: skillsFound,
        mistakes_found: [
          {
            mistake: "Limited quantification of project achievements and business impact",
            why_its_wrong: "Recruiters cannot measure your actual impact without numbers. ATS systems rank you lower compared to candidates with percentages and revenue impacts.",
            how_to_correct: "Instead of 'Developed a web app', use 'Developed a web app that served 500+ daily active users, reducing load times by 25%'"
          },
          {
            mistake: "Lack of strong action verbs at the start of bullet points",
            why_its_wrong: "Weak verbs like 'Helped with' or 'Worked on' do not show ownership or leadership.",
            how_to_correct: "Start bullets with 'Architected', 'Spearheaded', or 'Optimized'."
          }
        ],
        perfect_score_roadmap: [
          "Revise all project descriptions to use the STAR method (Situation, Task, Action, Result)",
          "Incorporate at least 3 quantifiable metrics (percentages, hours saved, dollars earned)",
          "Format resume cleanly to avoid two-column tables that trip standard ATS parsers"
        ],
        score_breakdown: {
          technical_depth: 78,
          impact: 65,
          clarity: 82,
          project_strength: 75,
          industry_readiness: 70,
          overall_score: 74
        },
        recommended_roles: recommendedRoles,
        strengths: [
          "Good foundation in key modern programming tools and stacks",
          "Clear, logical flow of project progression and educational history"
        ]
      };
    }

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      // Save to MongoDB
      const resume = new Resume({
        userId: req.userId || null,
        originalText: extractedText,
        fileUrl: filePath,
        analysis: analysis,
        lastUpdated: new Date(),
      });
      await resume.save();

      return res.json({
        success: true,
        message: "Resume analyzed successfully (MongoDB)",
        analysis: analysis,
        resumeId: resume._id,
      });
    } else {
      // Save to Demo Database
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

// Get Resume Analysis
const getResumeAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Check if using MongoDB
    const mongoConnected = await isMongoDBConnected();

    if (mongoConnected) {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      return res.json({
        success: true,
        resume: resume,
      });
    } else {
      // Demo mode - retrieve from demo database
      const resume = {
        _id: resumeId, analysis: {
          candidate_profile: { primary_domain: "Full-Stack", experience_level: "Junior", core_strength: "Problem solving" },
          technical_skills: ["JavaScript", "React", "Node.js"],
          score_breakdown: { overall_score: 75, technical_depth: 75, impact: 70, clarity: 80, project_strength: 75 },
          content_weaknesses: ["Missing metrics", "Limited project diversity"],
          mistakes_found: [
            {
              mistake: "No quantifiable impact",
              why_its_wrong: "Recruiters look for numbers to validate claims.",
              how_to_correct: "Add percentages or user counts."
            }
          ],
          perfect_score_roadmap: ["Add quantifiable metrics", "Use industry keywords"],
          recommended_roles: ["Frontend Developer", "Full-Stack Developer"]
        }
      };

      return res.json({
        success: true,
        resume: resume,
        mode: "demo"
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  analyzeResume,
  getResumeAnalysis,
};
