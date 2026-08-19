const {createAppointment, getMyAppointments, getDoctorAppointments, confirmAppointment, rejectAppointment, completeAppointment, cancelAppointment, getDoctorAvailability, getAllAppointments, getAppointmentStats} = require("../services/appointmentService");

const createAppointmentController = async (req,res) => {
    try {
        const {doctorId, appointmentDate, startTime, reason} = req.body;
        if(!doctorId || !appointmentDate || !startTime){
            return res.status(400).json({
                success: false,
                message: "Doctor, appointment date and start time are required"
            });
        }

        const appointment = await createAppointment({
            userId: req.user.id, doctorId, appointmentDate, startTime, reason
        });

        res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            data: appointment
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to create appointment"
        });
    }
};

const getMyAppointmentController = async (req,res) => {
    try {
        const appointments = await getMyAppointments({userId: req.user.id, status: req.query.status});
        res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch appointments"
        });
    }
};

const getDoctorAppointmentsController = async (req,res) => {
    try {
        const appointments = await getDoctorAppointments({
            userId: req.user.id, status: req.query.status
        });
        res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch doctor appointments"
        });
    }
};

const confirmAppointmentController = async (req,res) => {
    try {
        const appointment = await confirmAppointment({
            userId: req.user.id,
            appointmentId: req.params.id
        });
        res.status(200).json({
            success: true,
            message: "Appointment confirmed successfully",
            data: appointment
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            meaasge: err.message || "Failed to confirm appointment"
        });
    }
};

const rejectAppointmentController = async (req,res) => {
    try {
        const appointment = await rejectAppointment({
            userId: req.user.id,
            appointmentId: req.params.id,
            reason: req.body.reason
        });
        res.status(200).json({
            success: true,
            message: "Appointment rejected successfully",
            data: appointment
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to rejected Appointment"
        });
    }
};

const completeAppointmentController = async (req,res) => {
    try {
        const appointment = await completeAppointment({
            userId: req.user.id,
            appointmentId: req.params.id
        });

        res.status(200).json({
            success: true,
            message: "Appointment completed successfully",
            data: appointment
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to complete appointment"
        });
    }
};

const cancelAppointmentController = async (req,res) => {
    try {
        const appointment = await cancelAppointment({
            userId: req.user.id,
            appointmentId: req.params.id,
            reason: req.body.reason
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to cancel the appointment"
        });
    }
};

const getDoctorAvailabilityController = async (req,res) => {
    try {
        const {doctorId, date} = req.query;
        if(!doctorId || !date){
            return res.status(400).json({
                success: false,
                message: "Doctor ID and date are required"
            });
        }

        const availabilty = await getDoctorAvailability({doctorId, appointmentDate: date});
        res.status(200).json({
            success: true,
            data: {
                doctor: {
                    id: availabilty.doctor._id,
                    name: availabilty.doctor.userId.name,
                    specialization: getDoctorAvailability.doctor.specialization,
                    department: getDoctorAvailability.doctor.department
                },
                date: availabilty.date,
                day: availabilty.day,
                slots: availability.slots
            }
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch doctor availability"
        });
    }
};

const getAllAppointmentsController = async (req,res) => {
    try {
        const {status, doctorId, date, page, limit} = req.query;
        const res = await getAllAppointments({status, doctorId, date, page, limit});
        res.status(200).json({
            success: true,
            data: res.appointments,
            pagination: res.pagination
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch appointments"
        });
    }
};

const getAppointmentStatsController = async (req,res) => {
    try {
        
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to get appointment stats"
        });
    }
};

module.exports = {createAppointmentController, getMyAppointmentController, getDoctorAppointmentsController, confirmAppointmentController, rejectAppointmentController, completeAppointmentController, cancelAppointmentController, getDoctorAvailabilityController, getAllAppointmentsController};