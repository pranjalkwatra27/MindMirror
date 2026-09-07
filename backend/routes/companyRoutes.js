const express = require("express");
const { authenticateToken } = require("../config/auth");
const {
  getCompanyList,
  getCompanyPack,
} = require("../controllers/companyController");

const router = express.Router();

router.get("/list", authenticateToken, getCompanyList);
router.get("/pack", authenticateToken, getCompanyPack);

module.exports = router;
