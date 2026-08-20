const { create } = require("../models/Appointment");
const {createBill, getAllBills, getBillById, getMyBills, recordPayment} = require("../services/billingService");
const {patientBillDto, adminBillDto} = require("../dto/billlingDto");

const createBillController = async (req,res) => {
    try {
        const {appointmentId, items, discount, taxRate, notes} = req.body;
        if(!appointmentId || !items){
            return res.status(400).json({
                success: false,
                message: "Appointment ID and billing items are required"
            });
        }

        const bill = await createBill({
            userId: req.user.id,
            appointmentId,
            items,
            discount,
            taxRate,
            notes
        });
        res.status(201).json({
            success: true,
            message: "Bill created successfully",
            data: bill
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to create bill"
        });
    }
};

const getAllBillsController = async (req,res) => {
    try {
        const {paymentStatus, patientId, page, limit} = req.query;
        const res = await getAllBills({
            paymentStatus, patientId, page, limit
        });
        const data = res.bills.map(adminBillDto);
        res.status(200).json({
            success: true,
            data,
            pagination: res.pagination
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch bills"
        });
    }
};

const getBillByIdController = async (req,res) => {
    try {
        const bill = await getBillById(req.params.id);
        res.status(200).json({
            success: true,
            data: adminBillDto(bill)
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch bill"
        });
    }
};

const getMyBillsController = async (req,res) => {
    try {
        const {page,limit} = req.query;
        const res = await getMyBills({
            userId: req.user.id,
            page,
            limit
        });
        const data = res.bills.map(patientBillDto);
        res.status(200).json({
            success: true,
            data,
            pagination: res.pagination
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch  your bills"
        });
    }
};

const recordPaymentController = async (req,res) => {
    try {
        const {amount, paymentMethod, transactionId} = req.body;
        if(amount === undefined || !paymentMethod){
            return res.status(400).json({
                success: false,
                message: "Amount and payment method are required"
            });
        }
        const bill = await recordPayment({
            billId: req.params.id,
            amount,
            paymentMethod,
            transactionId,
            recordedBy: req.user.id
        });
        res.status(200).json({
            success: true,
            message: "Payment recorded successfully",
            data: bill
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to record payment"
        });
    }
};


module.exports = {createBillController, getAllBillsController, getBillByIdController, getMyBillsController, recordPaymentController};