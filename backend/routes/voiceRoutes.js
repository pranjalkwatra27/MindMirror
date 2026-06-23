const express = require("express");
const { authenticateToken } = require("../config/auth");
const { analyzeVoice } = require("../controllers/voiceController");

const router = express.Router();

router.post("/analyze", authenticateToken, analyzeVoice);

module.exports = router;
