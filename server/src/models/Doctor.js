const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        specialization: {
            type: String,
            required: true,
            trim: true
        },
        qualification: {
            type: String,
            required: true,
            trim: true
        },
        experience: {
            type: Number,
            required: true,
            min: 0
        },
        department: {
            type: String,
            required: true,
            trim: true
        },
        consultationFee: {
            type: Number,
            required: true,
            min: 0
        },
        licenseNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        availableDays: [
            {
                type: String,
                enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
            }
        ],
        availableTime: {
            start: String,
            end: String
        },
        bio: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);
const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;