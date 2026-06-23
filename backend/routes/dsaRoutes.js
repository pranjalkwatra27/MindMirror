const express = require("express");
const { generate, analyze } = require("../controllers/dsaController");

const router = express.Router();

// Public endpoints — no auth needed for a practice quiz
router.post("/generate", generate);
router.post("/analyze", analyze);

module.exports = router;
