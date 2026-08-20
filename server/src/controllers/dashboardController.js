const {getDashboardOverview, getAppointmentStatistics, getTodayAppointmentStatistics, getPatientStatistics, getDoctorStatistics, getBillingStatistics, getRevenueStatistics, getMonthlyRevenueTrend, getAdminDashboard} = require("../services/dashboardService");

const getAdminDashboardStatsController = async (req,res) => {
    try {
        const stats = await getAdminDashboardStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};

const getDashboardOverviewController = async (req,res) => {
    try {
        const data = await getDashboardOverview();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard overview"
        });
    }
};

const getAppointmentStatisticsController = async (req,res) => {
    try {
        const data = await getAppointmentStatistics();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch appointment statistics"
        });
    }
};

const getTodayAppointmentStatisticsController = async (req,res) => {
    try {
        const data = await getTodayAppointmentStatistics();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch today's appointment statistics"
        });
    }
};

const getPatientStatisticsController = async (req,res) => {
    try {
        const data = await getPatientStatistics();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch patient statistics"
        });
    }
};

const getDoctorStatisticsController = async (req,res) => {
    try {
        const data = await getDoctorStatistics();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch doctor statistics"
        });
    }
};

const getBillingStatisticsController = async (req,res) => {
    try {
        const data = await getBillingStatistics();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch billing statistics"
        });
    }
};

const getRevenueStatisticsController = async (req,res) => {
    try {
        const data = await getRevenueStatistics();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch revenue statistics"
        });
    }
};

const getMonthlyRevenueTrendController = async (req,res) => {
    try {
        const months = req.query.months || 6;
        const data = await getMonthlyRevenueTrend(months);
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch monthly revenue"
        });
    }
};

const getAdminDashboardController = async (req,res) => {
    try {
        const data = await getAdminDashboard();
        return res.status(200).json({
            success: true,
            data
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin dashboard"
        });
    }
};

module.exports = {getDashboardOverviewController, getAppointmentStatisticsController, getTodayAppointmentStatisticsController, getPatientStatisticsController, getDoctorStatisticsController, getBillingStatisticsController, getRevenueStatisticsController, getMonthlyRevenueTrendController, getAdminDashboardController};