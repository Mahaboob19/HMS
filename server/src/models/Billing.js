const mongoose = require("mongoose");
const billingSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true
        },
        consultationFee: {
            type: Number,
            default: 0,
            min: 0
        },
        medicineCharges: {
            type: Number,
            default: 0,
            min: 0
        },
        labCharges: {
            type: Number,
            default: 0,
            min: 0
        },
        roomCharges: {
            type: Number,
            default: 0,
            min: 0
        },
        otherCharges: {
            type: Number,
            default: 0,
            min: 0
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        tax: {
            type: Number,
            default: 0,
            min: 0
        },
        paymentStatus: {
            type: String,
            enum: ["pending","partial","paid","refund"],
            default: "pending"
        },
        paymentMethod: {
            type: String,
            enum: ["cash","card","upi","online","insurance"]
        },
        paidAt: {
            type: Date
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

const Billing = mongoose.model("Billing",billingSchema);

module.exports = Billing;