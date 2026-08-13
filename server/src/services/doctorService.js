const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const Doctor = require("../models/Doctor");

const createDoctor = async ({
    name, email, password, phone, specialization, department, qualification, experience, consultationFee, licenseNumber, availableDays, availableTime, bio
}) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({email: normalizedEmail}).session(session);
        if(existingUser){
            const error = new Error("User with this email already exists");
            error.statusCode = 409;
            throw error;
        }
        const existingDoctor = await Doctor.findOne({licenseNumber}).session(session);
        if(existingDoctor){
            const error = new Error("Doctor with this license number already exists");
            error.statusCode = 409;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const users = await User.create(
            [
                {
                    name, email: normalizedEmail, password, phone, role: "doctor"
                }
            ],
            {
                session
            }
        );
        const user = users[0];
        const doctors = await Doctor.create(
            [
                {
                    userId: user._id,
                    specialization,
                    department,
                    qualification,
                    experience,
                    consultationFee,
                    licenseNumber,
                    availableDays,
                    availableTime,
                    bio
                }
            ],
            {
                session
            }
        );
        const doctor = doctors[0];
        await session.commitTransaction();

        return {user, doctor};
    } catch (error) {
        await session.abortTransaction();
        throw error;
    }finally{
        session.endSession();
    }
};

const getDoctors = async ({page = 1, limit = 10, search, specialization, department}) => {
    const currentPage = Math.max(Number(page) || 1);
    const itemsPerPage = Math.min(Math.max(Number(limit) || 10, 1), 100);
    const skip = (currentPage - 1) * itemsPerPage;
    const filter = { isActive: true};

    if(search){
        filter.$or = [
            {
                specialization: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                department: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    if(specialization){
        filter.specialization = {
            $regex: specialization,
            $options: "i"
        };
    }

    if(department){
        filter.department = {
            $regex: department,
            $option: "i"
        };
    }

    const [doctors, totalDoctors] = await Promise.all([
        Doctor.find(filter).populate("userId","name email phone").sort({createdAt: -1}).skip(skip).limit(itemsPerPage),
        Doctor.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalDoctors/itemsPerPage);

    return {
        doctors,
        pagination: {
            currentPage, itemsPerPage, totalDoctors, totalPages, hasNextPage: currentPage < totalPages, hasPreviousPage: currentPage > 1
        }
    };
};

const getDoctorById = async (doctorId) => {
    if(!mongoose.Types.ObjectId.isValid(doctorId)){
        const err = new Error("Invalid doctor ID");
        err.statusCode = 400;
        throw err;
    }
    const doctor = await Doctor.findOne({ _id: doctorId, isActive: true}).populate("userId","name email phone");
    if(!doctor){
        const err = new Error("Doctor not found");
        err.statusCode = 404;
        throw err;
    }
    return doctor;
};

const updateDoctor = async (doctorId, updates) => {
    if(!mongoose.Types.ObjectId.isValid(doctorId)){
        const err = new Error("Invalid doctor ID");
        err.statusCode = 400;
        throw err;
    }
    const allowedFields = ["specialization", "department", "qualification", "experience", "consultationFee", "availableDays", "availableTime", "bio"];
    const updateData = {};
    for(const field of allowedFields){
        if(updates[field] !== undefined){
            updateData[field] = updates[field];
        }
    }
    if(Object.keys(updateData).length === 0){
        const err = new Error("No valid fields provided for update");
        err.statusCode = 400;
        throw err;
    }

    const doctor = await Doctor.findByIdAndUpdate(doctorId,
        {
            $set: updateData
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("userId","name email phone");

    if(!doctor){
        const err = new Error("Doctor not found");
        err.statusCode = 404;
        throw err;
    }
    return doctor;
};

const deactivateDoctor = async (doctorId) => {
    if(!mongoose.Types.ObjectId.isValid(doctorId)){
        const err = new Error("Invalid doctor ID");
        err.statusCode = 400;
        throw error;
    }
    const doctor = await Doctor.findByIdAndUpdate(doctorId, 
        {
            $set: {
                isActive: false
            }
        },
        {
            new: true
        }
    );
    if(!doctor){
        const err = new Error("Doctor not found");
        err.statusCode = 404;
        throw err;
    }
    return doctor;
};

module.exports = {createDoctor, getDoctors, getDoctorById, updateDoctor, deactivateDoctor};