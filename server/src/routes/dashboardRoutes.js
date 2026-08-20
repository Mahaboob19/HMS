const express = require("express");
const {protect, authorize} = require("../middleware/authMiddleware");
const {getDashboardOverviewController, getAppointmentStatisticsController, getTodayAppointmentStatisticsController, getPatientStatisticsController, getDoctorStatisticsController, getBillingStatisticsController, getRevenueStatisticsController, getMonthlyRevenueTrendController, getAdminDashboardController} = require("../controllers/dashboardController");
const router = express.Router();

router.get("/overview", protect, authorize("admin"), getDashboardOverviewController);
router.get("/appointments", protect, authorize("admin"), getAppointmentStatisticsController);
router.get("/appointments/today", protect, authorize("admin"), getTodayAppointmentStatisticsController);
router.get("/patients", protect, authorize("admin"), getPatientStatisticsController);
router.get("/doctors", protect, authorize("admin"), getDoctorStatisticsController);
router.get("/billing", protect, authorize("admin"), getBillingStatisticsController);
router.get("/revenue", protect, authorize("admin"), getRevenueStatisticsController);
router.get("/revenue/monthly", protect, authorize("admin"), getMonthlyRevenueTrendController);
router.get("/", protect, authorize("admin"), getAdminDashboardController);

module.exports = router;
