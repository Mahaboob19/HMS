const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Patient = require("../models/Patient");
const mongoose = require("mongoose");


const registerPatient = async ({
    name, email, password, phone, dateOfBirth, gender, bloodGroup, address
}) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({email: normalizedEmail}).session(session);
        if(existingUser){
            const error = new Error("User with this email already exists");
            error.statusCode = 400;
            throw error;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
    
        const user = await User.create([{
            name, email, password: hashedPassword, phone, role: "patient"
        }],{session});
    
        const patient = await Patient.create([{
            userId: user[0]._id, dateOfBirth, gender, bloodGroup, address
        }],{session});

        await session.commitTransaction();
        return {
            user: user[0],
            patient: patient[0]
        };

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }


};

module.exports = {registerPatient};