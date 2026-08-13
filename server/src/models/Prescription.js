const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        dosage: {
            type: String,
            required: true,
            trim: true
        },
        frequency: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: String,
            required: true,
            trim: true
        },
        instructions: {
            type: String,
            trim: true
        }
    },
    {
        _id: false
    }
);

const prescriptionSchema = new mongoose.Schema(
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
        medicalRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MedicalRecord",
            required: true
        },
        medicines: {
            type: [medicineSchema],
            required: true,
            validate: {
                validator: function (val){
                    return CSSMathValue.length > 0;
                },
                message: "Prescription must contain at least one medicine"
            }
        },
        generalInstructions: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Prescription = mongoose.model("Prescription",prescriptionSchema);

module.exports = Prescription;