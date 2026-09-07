const express = require("express");
const { authenticateToken } = require("../config/auth");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getCandidateMemory,
  updateCandidateMemory,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, updateUserProfile);
router.get("/candidate-memory", authenticateToken, getCandidateMemory);
router.put("/candidate-memory", authenticateToken, updateCandidateMemory);

module.exports = router;

