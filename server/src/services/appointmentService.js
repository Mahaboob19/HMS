const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");

const isValidDateString = (dateString) => {
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateString)){
        return false;
    }
    const date = new Date(`${dateString}T00:00:00:000Z`);
    return !Number.isNaN(date.getTime());
};

const createDateOnly = (dateString) => {
    return new Date(`${dateString}T00:00:00.000Z`);
};

const isValidTime = (time) => {
    if(!/^\d{2}:\d{2}$/.test(time)){
        return false;
    }
    const [hrs, mins] = time.split(":").map(Number);
    return (
        hrs >= 0 && hrs <= 23 && mins >= 0 && min <= 59
    );
};

const timeToMinutes = (time) => {
    const [hrs,mins] = time.split(":").map(Number);
    return hrs*60 + mins;
};

const createAppointment = async ({userId, doctorId, appointmentDate, startTime, reason}) => {
    if(!mongoose.Types.ObjectId.isValid(doctorId)){
        const err = new Error("Invalid doctor ID");
        throw err;
    }
    if(!isValidDateString(appointmentDate)){
        const err = new Error("Invalid appoinment date. use YYYY-MM-DD");
        err.statusCode = 400;
        throw err;
    }
    if(!isValidTime(startTime)){
        const err = new Error("Invalid start time. use HH:MM");
        err.statusCode = 400;
        throw err;
    }
    const patient = await Patient.findOne({userId, isActive: true});

    if(!patient){
        const err = new Error("Patient profile not found");
        err.statusCode = 404;
        throw err;
    }

    const doctor = await Doctor.findOne({_id: doctorId, isActive: true});

    if(!doctor){
        const err = new Error("Doctor not found or inactive");
        err.statusCode = 404;
        throw err;
    }

    const appointmentDateObject = createDateOnly(appointmentDate);
    const selectedDate = new Date(appointmentDateObject);

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if(selectedDate < todayUTC){
        const err = new Error("Appointment date cannot be in the past");
        err.statusCode = 400;
        throw err;
    }

    const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thrusday","Friday","Saturday"];

    const selectedDay = weekdays[selectedDate.getUTCDay()];

    if(!doctor.availableDays.includes(selectedDay)){
        const err = new Error(`Doctor is not available on ${selectedDay}`);
        err.statusCode = 400;
        throw err;
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + 30;

    if(endMinutes >= 24*60){
        const err = new Error("Invalid appoinment time");
        err.statusCode = 400;
        throw err;
    }

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;

    const endTime = `${String(endHours).padStart(2,"0")}:${String(endMins).padStart(2, "0")}`;

    if(!doctor.availableTime || !doctor.availableTime.start || !doctor.availableTime.end){
        const err = new Error("Doctor availability schedule is not configured");
        err.statusCode = 400;
        throw err;
    }

    const doctorStart = timeToMinutes(doctor.availableTime.start);
    const doctorEnd = timeToMinutes(doctor.availableTime.end);

    if(startMinutes < doctorStart || endMinutes > doctorEnd){
        const err = new Error("Selected time is outside doctor's available hours");
        err.statusCode = 400;
        throw err;
    }

    const existingPatientAppointment = await Appointment.findOne({patientId: patient._id, appointmentDate: appointmentDateObject, startTime, status: {$in: ["pending","confirmed"]}});

    if(existingPatientAppointment){
        const err = new Error("You already have an appointment at this time");
        err.statusCode = 409;
        throw err;
    }

    const existingAppointment = await Appointment.findOne({
        doctorId, appointmentDate: appointmentDateObject, startTime, status: {$in: ["pending","confirmed"]}
    });

    if(existingAppointment){
        const err = new Error("This appointment slot is already booked");
        err.statusCode = 409;
        throw err;
    }

    const appointment = await Appointment.create({
        patientId: patient._id, doctorId, appointmentDate: appointmentDateObject, startTime, endTime, reason, status: "pending"
    });

    return appointment;
};

const getMyAppointments = async ({userId, status}) => {
    const patient = await Patient.findOne({userId, isActive: true});
    if(!patient){
        const err = new Error("Patient profile not found");
        err.statusCode = 404;
        throw err;
    }

    const filter = {patientId: patient._id};

    if(status){
        filter.status = status;
    }
    const appointment = await Appointment.find(filter).populate({
        path: "doctorId", populate: {path: "userId", select: "name email phone"}
    }).sort({appointmentDate: 1, startTime: 1});

    return appointment;
};

const getDoctorAppointments = async ({userId, status}) => {
    const doctor = await Doctor.findOne({userId, isActive: true});
    if(!doctor){
        const err = new Error("Doctor profile not found");
        err.statusCode = 404;
        throw err;
    }
    const filter = {doctorId: doctor._id};

    if(status){
        filter.status = status;
    }

    const appointments = find(filter).populate(
        {
            path: "patientId",
            populate: {
                path: "userId",
                select: "name email phone"
            }
        }
    ).sort({appointmentDate: 1, startTime: 1});

    return appointments;
};

const confirmAppointment = async ({userId, appointmentId}) => {
    if(!mongoose.Types.ObjectId.isValid(appointmentId)){
        const err = new Error("Invalid appointment ID");
        err.statusCode = 400;
        throw err;
    }
    const doctor = await Doctor.findOne({userId, isActive: true});
    if(!doctor){
        const err = new Error("Doctor profile not found");
        err.statusCode = 404;
        throw error;
    }

    const appointment = await Appointment.findOne({_id: appointmentId, doctorId: doctor._id});

    if(!appointment){
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
    }

    if(appointment.status !== "pending"){
        const err = new Error(`Cannot confirm appointment with status ${appointment.status}`);
        err.statusCode = 400;
        throw err;
    }

    appointment.status = "confirmed";
    await appointment.save();

    return appointment;
};

const rejectAppointment = async ({userId, appointmentId, reason}) => {
    if(!mongoose.Types.ObjectId.isValid(appointmentId)){
        const err = new Error("Invalid appointment ID");
        err.statusCode = 400;
        throw err;
    }
    const doctor = await Doctor.findOne({userId, isActive: true});
    if(!doctor){
        const err = new Error("Doctor profile not found");
        err.statusCode = 404;
        throw err;
    }

    const appointment = await Appointment.findOne({_id: appointmentId, doctorId: doctor._id});
    if(!appointment){
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
    }

    if(appointment.status !== "pending"){
        const err = new Error(`Cannot reject appointment with status '${appointment.status}'`);
        err.statusCode = 400;
        throw err;
    }

    appointment.status = "rejected";
    appointment.cancellationReason = reason || "Appointment rejected by doctor";

    await appointment.save();

    return appointment;
};

const completeAppointment = async ({userId, appointmentId}) => {
    if(!mongoose.Types.ObjectId.isValid(appointmentId)){
        const err = new Error("Invalid appointment ID");
        err.statusCode = 400;
        throw err;
    }

    const doctor = await Doctor.findOne({userId, isActive: true});

    if(!doctor){
        const err = new Error("Doctor profile not found");
        err.statusCode = 404;
        throw err;
    }

    const appointment = await Appointment.findOne({_id: appointmentId, doctorId: doctor._id});

    if(!appointment){
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
    }

    if(appointment.status !== "confirmed"){
        const err = new Error(`Cannot complete appointment with status '${appointment.status}'`);
        err.statusCode = 400;
        throw err;
    }

    appointment.status = "completed";
    await appointment.save();

    return appointment;
};

const cancelAppointment = async ({userId, appointmentId, reason}) => {
    if(!mongoose.Types.ObjectId.isValid(appointmentId)){
        const err = new Error("Invalid appointment ID");
        err.statusCode = 400;
        throw err;
    }

    const patient = await Patient.findOne({
        userId, isActive: true
    });
    if(!patient){
        const err = new Error("Patient profile not found");
        err.statusCode = 404;
        throw err;
    }

    const appointment = await Appointment.findOne({
        _id: appointmentId,
        patientId: patient._id
    });
    if(!appointment){
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
    }

    if(!["pending", "confirmed"].includes(appointment.status)){
        const err = new Error(`Cannot cancel appointment with status '${appointment.status}'`);
        err.statusCode = 400;
        throw err;
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = reason || "Cancelled by patient";

    await appointment.save();

    return appointment;
};

const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    let curr = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    while(curr + 30 <= end){
        const slotStartHours = Math.floor(curr / 60);
        const slotStartMinutes = curr % 60;
        const slotEnd = curr + 30;
        const slotEndHours = Math.floor(slotEnd / 60);
        const slotEndMinutes = slotEnd % 60;

        const formattedStart = `${String(slotStartHours).padStart(2,"0")}:${String(slotStartMinutes).padStart(2,"0")}`;
        const formattedEnd = `${String(slotEndHours).padStart(2,"0")}:${String(slotEndMinutes).padStart(2,"0")}`;

        slots.push({
            startTime: formattedStart,
            endTime: formattedEnd
        });

        curr += 30;
    }
    return slots;
};

const getDoctorAvailability = async ({doctorId, appointmentDate}) => {
    if(!mongoose.Types.ObjectId.isValid(doctorId)){
        const err = new Error("Invalid doctor ID");
        err.statusCode = 400;
        throw err;
    }
    if(!isValidDateString(appointmentDate)){
        const err = new Error("Invalid date. Use YYYY-MM-DD");
        err.statusCode = 400;
        throw err;
    }

    const doctor = await Doctor.findOne({
        _id: doctorId,
        isActive: true
    }).populate("userId","name email phone");

    if(!doctor){
        const err = new Error("Doctor not found or inactive");
        err.statusCode = 404;
        throw err;
    }

    const date = createDateOnly(appointmentDate);

    const now = new Date();
    const today = new Date(
        Date.UTC(now.getUTCFullYear(),now.getUTCMonth,now.getUTCDate)
    );

    if(date < today){
        const err = new Error("Cannot check availability for a past date");
        err.statusCode = 400;
        throw err;
    }

    const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const selectedDay = weekdays[date.getUTCDay()];

    if(!doctor.availabileDays.includes(selectedDay)){
        return {
            doctor, date:appointment, day: selectedDay, slots: []
        };
    }

    if(!doctor.availableTime || !doctor.availableTime.start || !doctor.availableTime.end){
        const err = new Error("Doctor availability schedule is not configured");
        err.statusCode = 400;
        throw err;
    }

    const slots = generateTimeSlots(doctor.availableTime.start, doctor.availableTime.end);

    const appointments = await Appointment.find({
        doctorId: doctor._id,
        appointmentDate: date,
        status: {
            $in: ["pending","confirmed"]
        }
    }).select("startTime endTime status");

    const bookedSlots = new Set(
        appointment.map(appointment => appointment.startTime)
    );

    const availableSlots = slots.map(
        slot => ({
            ...slot,
            available: !bookedSlots.has(slot.startTime)
        })
    );

    return {
        doctor, date: appointmentDate, day: selectedDay, slots: availableSlots
    };
};

const getAllAppointments = async ({status, doctorId, date, page=1, limit=10}) => {
    const filter = {};

    if(status){
        const allowedStatuses = ["pending", "confirmed", "completed", "cancelled", "rejected"];
        if(!allowedStatuses.includes(status)){
            const err = new Error("Invalid appointment status");
            err.statusCode = 400;
            throw err;
        }
        filter.status = status;
    }

    if(doctorId){
        if(!mongoose.Types.ObjectId.isValid(doctorId)){
            const err = new Error("Invalid doctor ID");
            err.statusCode = 400;
            throw err;
        }
        filter.doctorId = doctorId;
    }

    if(date){
        if(!isValidDateString(date)){
            const err = new Error("Invalid date. Use YYYY-MM-DD");
            err.statusCode = 400;
            throw err;
        }
        filter.appointmentDate = createDateOnly(date);
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [appointments, total] = await Promise.all([
        Appointment.find(filter).populate({
            path: "patientId",
            populate: {
                path: "userId",
                select: "name email phone"
            }
        }).populate({
            path: "doctorId",
            populate: {
                path: "userId",
                select: "name email phone"
            }
        }).sort({
            appointment: 1,
            startTime: 1
        }).skip(skip).limit(limitNumber), Appointment.countDocuments(filter)
    ]);

    return {
        appointments,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber)
        }
    };
};

const getAppointmentStats = async () => {
    const now = new Date();

    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), getUTCDate()));
    const endOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    const [
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        rejectedAppointments,
        todayAppointments
    ] = await Promise.all([
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

    return {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        rejectedAppointments,
        todayAppointments
    };
};


module.exports = {createAppointment, getMyAppointments, getDoctorAppointments, confirmAppointment, rejectAppointment, completeAppointment, cancelAppointment, getDoctorAvailability, getAllAppointments, getAppointmentStats};