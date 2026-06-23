const express = require("express");
const { authenticateToken } = require("../config/auth");
const {
  getDashboardData,
  getProgressReport,
  generatePlacementScore,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", authenticateToken, getDashboardData);
router.get("/progress", authenticateToken, getProgressReport);
router.post("/placement-score", authenticateToken, generatePlacementScore);

module.exports = router;
