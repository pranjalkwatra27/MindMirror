const express = require("express");
const { authenticateToken } = require("../config/auth");
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviewHistory,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/start", authenticateToken, startInterview);
router.post("/submit-answer", authenticateToken, submitAnswer);
router.post("/:interviewId/complete", authenticateToken, completeInterview);
router.get("/history", authenticateToken, getInterviewHistory);

module.exports = router;
