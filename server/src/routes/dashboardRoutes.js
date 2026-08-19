const express = require("express");
const {protect, authorize} = require("../middleware/authMiddleware");
const {getAdminDashboardStatsController} = require("../controllers/dashboardController");
const router = express.Router();

router.get("/admin/stats", protect, authorize("admin"), getAdminDashboardStatsController);

module.exports = router;
