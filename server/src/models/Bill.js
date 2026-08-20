const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 200
        },
        category: {
            type: String,
            enum: ["consultation","medicine","lab","procedure","other"],
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: true
    }
);

const paymentSchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0.01
        },
        paymentMethod: {
            type: String,
            enum: ["cash","card","upi","online"],
            required: true
        },
        transactionId: {
            type: String,
            trim: true,
            maxLength: 100
        },
        paidAt: {
            type: Date,
            deafult: Date.now
        },
        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        _id: true
    }
);

const billSchema = new mongoose.Schema(
    {
        billNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
            index: true
        },
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            unique: true,
            index: true
        },
        items: {
            type: [billItemSchema],
            required: true,
            validate: {
                validator: function (item){
                    return item.length > 0;
                },
                message: "Bill must contain at least one item"
            }
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
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        amountPaid: {
            type: Number,
            default: 0,
            min: 0
        },
        paymentStatus: {
            type: String,
            enum: ["unpaid","partially_paid","paid"],
            default: "unpaid"
        },
        payments: {
            type: [paymentSchema],
            default: []
        },
        notes: {
            type: String,
            trim: true,
            maxLength: 1000
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model("Bill",billSchema);