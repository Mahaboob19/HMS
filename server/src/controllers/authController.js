const jwt = require("jsonwebtoken");
const {registerPatient} = require("../services/authService");
const User = require("../models/User");

const registerUser = async (req,res) => {
    try {
        const {name, email, password, phone, dateOfBirth, gender, bloodGroup, address} = req.body;
        if(!name || !email || !password || !dateOfBirth || !gender){
            return res.status(400).json({
                success: false,
                message: "Name, email, password, date of birth and gender are required"
            });
        }

        const result = await registerPatient({
            name, email, password, phone, dateOfBirth, gender, bloodGroup, address
        });

        const {user, patient} = result;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            patient: {
                id: patient._id,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                bloodGroup: patient.bloodGroup
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const loginUser = async (req,res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({email}).select("+password");
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

module.exports = {registerUser, loginUser};