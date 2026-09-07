const { generateCompanyPrepPack } = require("../utils/aiService");

// Curated list of popular companies with badges and categories
const curatedCompanies = [
  { id: "google", name: "Google", tier: "Tier 1 Product", logo: "G", color: "from-blue-500 to-red-500", roles: ["Software Engineer", "Frontend Specialist", "Site Reliability Engineer"] },
  { id: "amazon", name: "Amazon", tier: "Tier 1 Product", logo: "A", color: "from-amber-500 to-yellow-600", roles: ["Software Development Engineer (SDE)", "Full-Stack Dev", "DevOps"] },
  { id: "microsoft", name: "Microsoft", tier: "Tier 1 Product", logo: "M", color: "from-blue-600 to-cyan-500", roles: ["Software Engineer", "Cloud Solutions Architect", "Full-Stack"] },
  { id: "adobe", name: "Adobe", tier: "Tier 1 Product", logo: "Ad", color: "from-red-600 to-pink-600", roles: ["Member of Technical Staff", "Frontend Engineer", "Computer Scientist"] },
  { id: "tcs", name: "TCS (Digital / Prime / Ninja)", tier: "IT Services & Consulting", logo: "TCS", color: "from-indigo-600 to-blue-700", roles: ["Digital Developer", "Prime Software Engineer", "Ninja Dev"] },
  { id: "infosys", name: "Infosys (Specialist / DSE)", tier: "IT Services & Consulting", logo: "INF", color: "from-sky-600 to-blue-800", roles: ["Specialist Programmer (SP)", "Digital Specialist Engineer", "System Engineer"] },
  { id: "wipro", name: "Wipro (Turbo / Elite)", tier: "IT Services & Consulting", logo: "WIP", color: "from-emerald-500 to-teal-700", roles: ["Turbo Developer", "Elite Associate"] },
  { id: "accenture", name: "Accenture", tier: "Consulting & Tech", logo: "ACC", color: "from-purple-600 to-violet-800", roles: ["Advanced App Engineering Analyst", "Associate Software Engineer"] },
  { id: "deloitte", name: "Deloitte", tier: "Consulting & Tech", logo: "DEL", color: "from-lime-600 to-green-700", roles: ["Analyst - Software Development", "Cloud & Solutions Engineer"] },
];

// Get List of Supported Companies
const getCompanyList = async (req, res) => {
  try {
    return res.json({
      success: true,
      companies: curatedCompanies,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get / Generate Deep Preparation Pack for a Company
const getCompanyPack = async (req, res) => {
  try {
    const { companyName, role, experienceLevel } = req.query;
    const targetCompany = companyName || "Google";
    const targetRole = role || "Software Engineer";
    const exp = experienceLevel || "Fresher";

    const pack = await generateCompanyPrepPack(targetCompany, targetRole, exp);

    return res.json({
      success: true,
      pack,
    });
  } catch (error) {
    console.error("Error in getCompanyPack:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCompanyList,
  getCompanyPack,
};
