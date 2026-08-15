const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const Patient = require("../models/Patient");

const createPatient = async ({name, email, password, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions}) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({email: normalizedEmail}).session(session);

        if(existingUser){
            const err = new Error("User with this email already exists");
            err.statusCode = 409;
            throw err;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const users = await User.create(
            [
                {name, email: normalizedEmail, password: hashedPassword, phone, role: "patient"}
            ],
            {session}
        );
        const user = users[0];

        const patients = await Patient.create(
            [
                {userId: user._id, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions}
            ],
            {session}
        );
        const patient = patients[0];

        await session.commitTransaction();

        return {user, patient}
    } catch (err) {
        await session.abortTransaction();
        throw err;
    }finally {
        session.endSession();
    }
};

const getMyProfile = async (userId) => {
    if(!mongoose.Types.ObjectId.isValid(userId)) {
        const err = new Error("Invalid user ID");
        err.statusCode = 400;
        throw error;
    }
    const patient = await Patient.findOne({
        userId, isActive: true
    }).populate("userId","name email phone");
    if(!patient){
        const err = new Error("Patient profile not found");
        err.statusCode = 404;
        throw err;
    }
    return patient;
};

const updateMyProfile = async (userId, updates) => {
    if(!mongoose.Types.ObjectId.isValid(userId)){
        const err = new Error("Invalid user ID");
        err.statusCode = 400;
        throw err;
    }
    const allowedFields = ["phone","dateOfBirth","gender","bloodGroup","address","emergencyContact","allergies","chronicConditions"];
    const patientUpdates = {};

    for(const field of allowedFields){
        if(updates[field] !== undefined){
            patientUpdates[field] = updates[field];
        }
    }

    if(Object.keys(patientUpdates).length === 0){
        const err = new Error("No valid fields provided for update");
        err.statusCode = 400;
        throw err;
    }
    const patient = await Patient.findByIdAndUpdate(
        {
            userId, isActive: true
        },
        {
            $set: patientUpdates
        },
        {
            new: true,
            runValidators: true
        }
    ).populate("userId","name email phone");

    if(!patient){
        const err = new Error("Patient profile not found");
        err.statusCode = 404;
        throw err;
    }
    return patient;
};

module.exports = { createPatient, getMyProfile, updateMyProfile };