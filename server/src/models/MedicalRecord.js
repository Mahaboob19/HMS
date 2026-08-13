const mongoose = require("mongoose");
const medicalRecordSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true
        },
        symptoms: {
            types: String,
            trim: true
        },
        diagnosis: {
            type: String,
            required: true,
            trim: true
        },
        examination: {
            type: String,
            trim: true
        },
        treatment: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        followUpDate: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);
const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

module.exports = MedicalRecord;