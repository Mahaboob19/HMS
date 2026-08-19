const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

const getAdminDashboardStats = async () => {
    const now = new Date();

    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const [
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAppointments,

        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        rejectedAppointments,
        todayAppointments
    ] = await Promise.all([
        User.countDocuments(),
        Patient.countDocuments({
            isActive: true
        }),
        Doctor.countDocuments({
            isActive: true
        }),
        Appointment.countDocuments(),
        Appointment.countDocuments({
            status: "pending"
        }),
        Appointment.countDocuments({
            status: "confirmed"
        }),
        Appointment.countDocuments({
            status: "completed"
        }),
        Appointment.countDocuments({
            status: "cancelled"
        }),
        Appointment.countDocuments({
            status: "rejected"
        }),
        Appointment.countDocuments({
            appointmentDate: {
                $gte: startOfToday,
                $lt: endOfToday
            }
        })
    ]);
};