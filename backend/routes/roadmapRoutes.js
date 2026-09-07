const express = require("express");
const { authenticateToken } = require("../config/auth");
const {
  generateRoadmap,
  getRoadmap,
  toggleTaskCompletion,
} = require("../controllers/roadmapController");

const router = express.Router();

router.get("/", authenticateToken, getRoadmap);
router.post("/generate", authenticateToken, generateRoadmap);
router.put("/toggle-task", authenticateToken, toggleTaskCompletion);

module.exports = router;
