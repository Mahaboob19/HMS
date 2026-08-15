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
            street: String,
            city: String,
            state: String,
            pincode: String
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
        },
        allergies: [
            {
                type: String,
                trim: true
            }
        ],
        chronicConditions: [
            {
                type: String,
                trim: true
            }
        ],
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);
const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;