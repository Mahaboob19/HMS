const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const {getNextSequence} = require("./counterService");

const generateBillNumber = async () => {
    const year = new Date().getFullYear();
    const seq = await getNextSequence("bill");

    return `HMS-${year}-${String(seq).padStart(6,"0")}`;
};

const calculateBillTotals = ({items, discount = 0, taxRate = 0}) => {
    if(!Array.isArray(items) || items.length === 0){
        const err = new Error("At least one billing item is required");
        err.statusCode = 400;
        throw err;
    }

    const normalizedItems = items.map(item => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        if(!Number.isFinite(quantity) || quantity <= 0){
            const err = new Error("Invalid item quantity");
            err.statusCode = 400;
            throw err;
        }
        if(!Number.isFinite(unitPrice) || unitPrice < 0){
            const err = new Error("Invalid item price");
            err.statusCode = 400;
            throw err;
        }

        if(!item.description || typeof item.description !== "string" || !item.description.trim()){
            const err = new Error("Item description is required");
            err.statusCode = 400;
            throw err;
        }

        if(!item.category || typeof item.category !== "string" || !item.category.trim()){
            const err = new Error("Item category is required");
            err.statusCode = 400;
            throw err;
        }

        const total = Number((quantity * unitPrice).toFixed(2));

        return {
            description: item.description.trim(),
            category: item.category.trim(),
            quantity, unitPrice,
            total
        };
    });

    const subtotal = Number(normalizedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2));
    const discountAmount = Number(discount);

    if(!Number.isFinite(discountAmount) || discountAmount < 0){
        const err = new Error("Invalid discount");
        err.statusCode = 400;
        throw err;
    }

    if(discountAmount > subtotal){
        const err = new Error("Discount cannot exceed subtotal");
        err.statusCode = 400;
        throw err;
    }

    const rate = Number(taxRate);
    if(!Number.isFinite(rate) || rate < 0){
        const err = new Error("Invalid tax rate");
        err.statusCode = 400;
        throw err;
    }
    if(rate > 100){
        const err = new Error("Tax rate cannot exceed 100%");
        err.statusCode = 400;
        throw err;
    }

    const taxableAmount = subtotal - discountAmount;
    const tax = Number((taxableAmount * (rate / 100)).toFixed(2));
    const totalAmount = Number((taxableAmount + tax).toFixed(2));

    return {
        items: normalizedItems,
        subtotal,
        discount: Number(discountAmount).toFixed(2),
        tax,
        totalAmount
    };
};

const createBill = async ({userId, appointmentId, items, discount, taxRate, notes}) => {
    if(!mongoose.Types.ObjectId.isValid(appointmentId)){
        const err = new Error("Invalid appointment ID");
        err.statusCode = 400;
        throw err;
    }

    const appointment = await Appointment.findById(appointmentId);
    if(!appointment){
        const err = new Error("Appointment not found");
        err.statusCode = 404;
        throw err;
    }

    if(appointment.status !== "completed"){
        const err = new Error("Bill can only be created for a completed appointment");
        err.statusCode = 400;
        throw err;
    }

    const existingBill = await Bill.findOne({appointmentId});
    if(existingBill){
        const err = new Error("A bill already exists for this appointment");
        err.statusCode = 409;
        throw err;
    }

    const totals = calculateBillTotals({items, discount, taxRate});
    const billNumber = await generateBillNumber();
    const bill = await Bill.create({
        billNumber,
        patientId: appointment.patientId,
        appointmentId,
        items: totals.items,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        totalAmount: totals.totalAmount,
        amountPaid: 0,
        paymentStatus: "unpaid",
        notes,
        createdBy: userId
    });

    return bill;
};

const getAllBills = async ({paymentStatus, patientId, page=1, limit=10}) => {
    const filter = {};
    if(paymentStatus){
        const allowedStatuses = ["unpaid","partially_paid","paid"];
        if(!allowedStatuses.includes(paymentStatus)){
            const err = new Error("Invalid payment status");
            err.statusCode = 400;
            throw err;
        }
        filter.paymentStatus = paymentStatus;
    }

    if(patientId){
        if(!mongoose.Types.ObjectId.isValid(patientId)){
            const err = new Error("Invalid patient ID");
            err.statusCode = 400;
            throw err;
        }
        filter.patientId = patientId;
    }

    const pageNumber = Math.max(Number(page),1);
    const limitNumber = Math.min(Math.max(Numbar(limit),1), 100);
    const skip = (pageNumber - 1)*limitNumber;

    const [bills, total] = await Promise.all([
        Bill.find(filter).populate({
            path: "patientId",
            populate: {
                path: "userId",
                select: "name email phone"
            }
        }).populate({
            path: "appointmentId",
            select: "appointmentDate startTime endTime status"
        }).populate({
            path: "createdBy",
            select: "name email role"
        }).populate({
            path: "payments.recordedBy",
            select: "name email role"
        }).sort({
            createdAt: -1
        }).skip(skip).limit(limitNumber),

        Bill.countDocuments(filter)
    ]);

    return {
        bills,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            toatalPages: Math.ceil(total / limitNumber)
        }
    };
};

const getBillById = async (billId) => {
    if(!mongoose.Types.ObjectId.isValid(billId)){
        const err = new Error("Invalid bill ID");
        err.statusCode = 400;
        throw err;
    }

    const bill = await Bill.findById(billId).populate({
        path: "patientId",
        populate: {
            path: "userId",
            select: "name email phone"
        }
    }).populate({
        path: "appointmentId",
        populate: {
            path: "doctorId",
            populate: {
                path: "userId",
                select: "name email phone"
            }
        }
    }).populate({
        path: "createdBy",
        select: "name, email, role"
    }).populate({
        path: "payments.recordedBy",
        select: "name email role"
    });

    if(!bill){
        const err = new Error("Bill not found");
        err.statusCode = 404;
        throw err;
    }

    return bill;
};

const getMyBills = async ({userId, page=1, limit=10}) => {
    const patient = await Patient.findOne({userId});
    if(!patient){
        const err = new Error("Patient profile not found");
        err.statusCode = 404;
        throw err;
    }

    const pageNumber = Math.max(Number(page),1);
    const limitNumber = Math.min(Math.max(Number(limit),1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const [bills, total] = await Promise.all([
        Biil.find({
            patientId: patient._id
        }).populate({
            path: "appointmentId",
            select: "appointmentDate startTime endTime status"
        }).sort({
            createdAt: -1
        }).skip(skip).limit(limitNumber),

        Bill.countDocuments({
            patientId: patient._id
        })
    ]);

    return {
        bills,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            toatalPages: Math.ceil(total / limitNumber)
        }
    };
};

const recordPayment = async ({billId, amount, paymentMethod, transactionId, recordedBy}) => {
    if(!mongoose.Types.ObjectId.isValid(billId)){
        const err = new Error("Invalid bill ID");
        err.statusCode = 400;
        throw err;
    }
    const paymentAmount = Number(amount);
    if(!Number.isFinite(paymentAmount) || paymentAmount <= 0){
        const err = new Error("Payment amount must be greather than zero");
        err.statusCode = 400;
        throw err;
    }

    const allowedMethods = ["cash","card","upi","online"];
    if(!allowedMethods.includes(paymentMethod)){
        const err = new Error("Invalid payment method");
        err.statusCode = 400;
        throw err;
    }

    const bill = await Bill.findOneAndUpdate(
        {_id: billId,
        paymentStatus: {
            $ne: "paid"
        },
        $expr: {
            $lte: [
                {
                    $add: [
                        "$amountPaid", paymentAmount
                    ]
                },
                "$totalAmount"
            ]
        }
        },
        {
            $inc: {
                amountPaid: paymentAmount
            },
            $push: {
                payments: {
                    amount: paymentAmount,
                    paymentMethod,
                    transactionId,
                    recordedBy,
                    paidAt: new Date()
                }
            }
        },
        {
            new: true
        }
    );
    if(!bill){
        const existingBill = await Bill.findById(billId);
        if(!existingBill){
            const err = new Error("Bill not found");
            err.statusCode = 404;
            throw err;
        }
        if(existingBill.paymentStatus === "paid"){
            const err = new Eroor("This bill is already fully paid");
            err.statusCode = 400;
            throw err;
        }
        const remaining = Number((existingBill.totalAmount - existingBill.amountPaid).toFixed(2));
        const err = new Error(`Payment exceeds remaining amount of ${remaining}`);
        err.statusCode = 400;
        throw err;
    }

    bill.paymentStatus = bill.amountPaid === bill.totalAmount ? "paid" : "partially_paid";

    await bill.save();

    return bill;
};



module.exports = {createBill, getAllBills, getBillById, getMyBills, recordPayment};