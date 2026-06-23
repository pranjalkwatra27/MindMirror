const express = require("express");
const multer = require("multer");
const path = require("path");
const { authenticateToken } = require("../config/auth");
const {
  analyzeResume,
  getResumeAnalysis,
} = require("../controllers/resumeController");

const router = express.Router();

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/resumes/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

router.post("/analyze", authenticateToken, upload.single("resume"), analyzeResume);
router.get("/:resumeId", authenticateToken, getResumeAnalysis);

module.exports = router;
