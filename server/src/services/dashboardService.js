const User = require("../models/User");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Bill = require("../models/Bill");


const getDashboardOverview = async () => {
    const [totalUsers, totalPatients, totalDoctors, totalAppointments, totalBills] = await Promise.all([
        User.countDocuments(),
        Patient.countDocuments(),
        Doctor.countDocuments(),
        Appointment.countDocuments(),
        Bill.countDocuments()
    ]);

    return {
        totalUsers, totalPatients, totalDoctors, totalAppointments, totalBills
    };
};

const getAppointmentStatistics = async () => {
    const res = await Appointment.aggregate([
        {
            $group: {
                _id: "$status",
                count: {
                    $sum: 1
                }
            }
        }
    ]);
    const statistics = {
        pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0
    };

    res.forEach((itm) => {
        if(itm._id === "pending"){
            statistics.pending = itm.count;
        }else if(itm._id === "confirmed"){
            statistics.confirmed = itm.count;
        }else if(itm._id === "completed"){
            statistics.completed = itm.count;
        }else if(itm._id === "cancelled"){
            statistics.cancelled = itm.count;
        }else if(itm._id === "rejected"){
            statistics.rejected = itm.count;
        }
    });

    return statistics;
};

const getTodayAppointmentStatistics = async () => {
    const now = new Date();
    const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    );

    const res = await Appointment.aggregate([
        {
            $match: {
                appointmentDate: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }
        },
        {
            $group: {
                _id: "$status",
                count: {
                    $sum: 1
                }
            }
        }
    ]);

    const statistics = {
        total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, rejected: 0
    };

    res.forEach((i) => {
        if(i._id === "pending"){
            statistics.pending = i.count;
        }else if(i._id === "confirmed"){
            statistics.confirmed = i.count;
        }else if(i._id === "completed"){
            statistics.completed = i.count;
        }else if(i._id === "cancelled"){
            statistics.cancelled = i.count;
        }else if(i._id === "rejected"){
            statistics.rejected = i.count;
        }
    });

    statistics.total = statistics.pending + statistics.confirmed + statistics.completed + statistics.cancelled + statistics.rejected;

    return statistics;
};

const getPatientStatistics = async () => {
    const now = new Date();
    const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    const startOfTomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    );
    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );
    const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    );

    const [totalPatients, newPatientsToday, newPatientThisMonth] = await Promise.all([
        Patient.countDocuments(),
        Patient.countDocuments({
            createdAt: {
                $gte: startOfToday,
                $lt: startOfTomorrow
            }
        }),
        Patient.countDocuments({
            createdAt: {
                $gte: startOfMonth,
                $lt: startOfNextMonth
            }
        })
    ]);

    return {
        totalPatients, newPatientsToday, newPatientThisMonth
    };
};

const getDoctorStatistics = async () => {
    const [totalDoctors, activeDoctors, inactiveDoctors, doctorByDepartment] = await Promise.all([
        Doctor.countDocuments(),
        Doctor.countDocuments({
            isActive: true
        }),
        Doctor.countDocuments({
            isActive: false
        }),
        Doctor.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ])
    ]);

    const departmentStatistics = doctorByDepartment.map((i) => {
        return {
            department: i._id,
            count: i.count
        };
    });

    return {
        totalDoctors, activeDoctors, inactiveDoctors, doctorByDepartment: departmentStatistics
    };
};

const getBillingStatistics = async () => {
    const res = await Bill.aggregate([
        {
            $group: {
                _id: null,
                totalBills: {
                    $sum: 1
                },
                totalBilled: {
                    $sum: "$totalAmount"
                },
                totalCollected: {
                    $sum: "$amountPaid"
                },
                paidBills: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$paymentStatus", "paid"]
                            }, 1, 0
                        ]
                    }
                },
                unpaidBills: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$paymentStatus","unpaid"]
                            }, 1, 0
                        ]
                    }
                },
                partiallyPaidBills: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$paymentStatus","partially_paid"]
                            }, 1, 0
                        ]
                    }
                }
            }
        }
    ]);

    if(res.lenth === 0){
        return {
            totalBills: 0, totalBilled: 0, totalCollected: 0, totalOutstanding: 0, paidBills: 0, unpaidBills: 0,partiallyPaidBills: 0
        };
    }

    const data = res[0];

    const totalOutstanding = Number((data.totalBilled - data.totalCollected).toFixed(2));

    return {
        totalBills: data.totalBills,
        totalBilled: data.totalBilled.toFixed(2),
        totalCollected: Number(data.totalCollected.toFixed(2)),
        totalOutstanding,
        paidBills: data.paidBills,
        unpaidBills: data.unpaidBills,
        partiallyPaidBills: data.partiallyPaidBills
    }
};

const getRevenueStatistics = async () => {
    const now = new Date();
    const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );
    const startOfTomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    );
    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );
    const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    );

    const [todayResult, monthResult] = await Promise.all([
        Bill.aggregate([
            {
                $match: {
                   createdAt: {
                    $gte: startOfToday,
                    $lt: startOfTomorrow
                   } 
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$amountPaid"
                    }
                }
            }
        ]),
        Bill.aggregate([
            {
                $match: {
                   createdAt: {
                    $gte: startOfMonth,
                    $lt: startOfNextMonth
                   } 
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: {
                        $sum: "$amountPaid"
                    }
                }
            }
        ])
    ]);

    const todayRevenue = todayResult.length > 0 ? todayResult[0].revenue : 0;
    const monthlyRevenue = monthResult.length > 0 ? monthResult[0].revenue : 0;

    return {
        todayRevenue: Number(todayRevenue.toFixed(2)),
        monthlyRevenue: Number(monthlyRevenue.toFixed(2))
    };
};

const getMonthlyRevenueTrend = async (months = 6) => {
    const numberOfMonths = Math.min(Math.max(Number(months) || 6, 1), 12);

    const now = new Date();
    const startDate = new Date(
        now.getFullYear(),
        now.getMonth() - (numberOfMonths - 1),
        1
    );

    const res = await Bill.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate
                }
            }
        },
        {
            $group: {
                _id: {
                    year: {
                        $year: "$createdAt"
                    },
                    month: {
                        $month: "$createdAt"
                    }
                },
                revenue: {
                    $sum: "$amountPaid"
                }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1
            }
        }
    ]);

    const revenueMap = {};

    res.forEach((i) => {
        const key = `${i._id.year}-${String(i._id.month).padStart(2,"0")}`;
        revenueMap[key] = Number(i.revenue.toFixed(2));
    });

    const monthlyRevenue = [];

    for(let i=0;i<numberOfMonths;i++){
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - (numberOfMonths - 1 - i),
            1
        );
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2,"0")}`;

        monthlyRevenue.push({
            year, month, revenue: revenueMap[key] || 0
        });
    }

    return monthlyRevenue;

};

const getAdminDashboard = async () => {
    const [
        overview,
        appointmentStatistics,
        todayAppointmentStatistics,
        patientStatistics,
        doctorStatistics,
        billingStatistics,
        revenueStatistics,
        monthlyRevenueTrend
    ] = await Promise.all([
        getDashboardOverview(),
        getAppointmentStatistics(),
        getTodayAppointmentStatistics(),
        getPatientStatistics(),
        getDoctorStatistics(),
        getBillingStatistics(),
        getRevenueStatistics(),
        getMonthlyRevenueTrend(6)
    ]);

    return {
        overview,
        appointments: {
            overall: appointmentStatistics,
            today: todayAppointmentStatistics
        },
        patients: patientStatistics,
        doctors: doctorStatistics,
        billing: billingStatistics,
        revenue: {
            today: revenueStatistics.todayRevenue,
            thisMonth: revenueStatistics.monthlyRevenue,
            monthlytrend: monthlyRevenueTrend
        }
    };
};


module.exports = {getDashboardOverview, getAppointmentStatistics, getTodayAppointmentStatistics, getPatientStatistics, getDoctorStatistics, getBillingStatistics, getRevenueStatistics, getMonthlyRevenueTrend, getAdminDashboard};