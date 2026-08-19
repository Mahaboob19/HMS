const {getAdminDashboardStats} = require("../services/dashboardService");

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

module.exports = {getAdminDashboardStatsController};