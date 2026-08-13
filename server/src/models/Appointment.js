const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            require: true
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },
        appointmentDate: {
            type: Date,
            required: true
        },
        appointmentTime: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            trim: true
        },
        symptoms: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["pending","confirmed","completed","cancelled"],
            default: "pending"
        },
        consultationNotes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);
const Appointment = mongoose.model("Appointment",appointmentSchema);
module.exports = Appointment;