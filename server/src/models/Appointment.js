const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema(
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
        appointmentDate: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        reason: {
            type: String,
            trim: true,
            maxlength: 500
        },
        status: {
            type: String,
            enum: ["pending","confirmed","completed","cancelled","rejected"],
            default: "pending"
        },
        cancellationReason: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

appointmentSchema.index(
    {
        doctorId: 1,
        appointmentDate: 1,
        startTime: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            status: {
                $in: ["pending","confirmed"]
            }
        }
    }
);

const Appointment = mongoose.model("Appointment",appointmentSchema);
module.exports = Appointment;