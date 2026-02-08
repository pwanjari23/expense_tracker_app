const express = require("express");
const router = express.Router();
const premiumFeatureController = require("../controllers/premiumFeatureController");
const authenticateToken = require("../middleware/authenticateToken");

router.get("/getLeaderboard/:id", premiumFeatureController.getLeaderboard);
router.get("/download", authenticateToken, premiumFeatureController.downloadExpenses); // JSON
router.get("/downloads", authenticateToken, premiumFeatureController.getDownloadedFiles); // past JSON
router.get("/getexpencereport/:id", authenticateToken, premiumFeatureController.getExpenseReport); // PDF
router.get("/reports", authenticateToken, premiumFeatureController.getPastReports); // past PDF reports

module.exports = router;
