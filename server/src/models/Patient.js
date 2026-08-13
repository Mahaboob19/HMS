const mongoose = require("mongoose");
const patientSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ["male","female","other"],
            required: true
        },
        bloodGroup: {
            type: String,
            enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-"]
        },
        address: {
            type: String,
            trim: true
        },
        emergencyContact: {
            name: {
                type: String,
                trim: true
            },
            phone: {
                type: String,
                trim: true
            },
            relationship: {
                type: String,
                trim: true
            }
        }
    },
    {
        timestamps: true
    }
);
const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;