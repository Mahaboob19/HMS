const patientBillDto = (bill) => {
    return {
        id: bill._id,
        billNumber: bill.billNumber,
        appointmentId: bill.appointmentId,
        items: bill.items,
        subtotal: bill.subtotal,
        discount: bill.discount,
        tax: bill.tax,
        totalAmount: bill.totalAmount,
        amountPaid: bill.amountPaid,
        remainingAmount: Number((bill.totalAmount - bill.amountPaid).toFixed(2)),
        paymentStatus: bill.paymentStatus,
        payments: bill.payments.map(
            payment => ({
                id: payment._id,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                transactionId: payment.transactionId,
                paidAt: payment.paidAt
            })
        ),
        createdAt: bill.createdAt
    };
};

const adminBillDto = (bill) => {
    return {
        id: bill._id,
        billNumber: bill.billNumber,
        patient: bill.patientId ? {
            id: bill.patientId._id,
            name: bill.patientId.userId?.name,
            email: bill.patientId.userId?.email,
            phone: bill.patientId.userId?.phone
        } : null,
        appointmentId: bill.appointmentId,
        items: bill.items,
        subtotal: bill.subtotal,
        discount: bill.discount,
        tax: bill.tax,
        totalAmount: bill.totalAmount,
        amountPaid: bill.amountPaid,
        remainingAmount: Number((bill.totalAmount - bill.amountPaid).toFixed(2)),
        paymentStatus: bill.paymentStatus,
        payments: bill.payments.map(
            payment => ({
                id: payment._id,
                amount: payment.amount,
                paymentMethod: payment.paymentMethod,
                transactionId: payment.transactionId,
                paidAt: payment.paidAt,
                recordedBy: payment.recordedBy ? {
                    id: payment.recordedBy._id,
                    name: payment.recordedBy.name,
                    email: payment.recordedBy.email
                } : null
            })
        ),
        createdBy: bill.createdBy ? {
            id: bill.createdBy._id,
            name: bill.createdBy.name,
            email: bill.createdBy.email
        } : null,
        notes: bill.notes,
        createdAt: bill.createdAt
    };
};


module.exports = {patientBillDto, adminBillDto};