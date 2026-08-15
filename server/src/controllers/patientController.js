const {createPatient, getMyProfile, updateMyProfile} = require("../services/patientService");

const createPatientController = async (req,res) => {
    try {
        const {name, email, password, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions} = req.body;
        if(!name || !email || !password || !phone || !dateOfBirth || !gender){
            return res.status(400).json({
                success: false,
                message: "Required patient information is missing"
            });
        }

        const result = await createPatient({name, email, password, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact, allergies, chronicConditions});
        res.status(201).json({
            success: true,
            message: "Patient registered successfully",
            user: {
                id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                phone: result.user.phone,
                role: result.user.role
            },
            patient: {
                id: result.patient._id,
                dateOfBirth: result.patient.dateOfBirth,
                gender: result.patient.gender,
                bloodGroup: result.patient.bloodGroup
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Patient registration failed"
        });
    }
};

const getMyProfileController = async (req,res) => {
    try {
        const patient = await getMyProfile(req.user.id);
        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch patient profile"
        });
    }
}

const updateMyProfileController = async (req,res) => {
    try {
        const patient = await updateMyProfile(req.params.id,req.body);
        res.status(200).json({
            success: true,
            message: "Patient profile updated successfully",
            data: patient
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to update patient profile"
        });
    }
};

module.exports = {createPatientController, getMyProfileController, updateMyProfileController};