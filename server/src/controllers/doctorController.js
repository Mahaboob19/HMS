const {createDoctor, getDoctors, getDoctorById, updateDoctor, deactivateDoctor} = require("../services/doctorService");

const createDoctorController = async (req,res) => {
    try {
        const {name, email, password, phone, specialization, department, qualification, experience, consultationFee, licenseNumber, availableDays, availableTime, bio} = req.body;
        if(!name || !email || !password || !specialization || !department || !qualification || consultationFee === undefined || !licenseNumber){
            return res.status(400).json({
                success: false,
                message: "Required doctor information is missing"
            });
        }
        const result = await createDoctor({name, email, password, phone, specialization, department, qualification, experience, consultationFee, licenseNumber, availableDays, availableTime, bio});
        res.status(201).json({
            success: true,
            message: "Doctor created successfully",
            user: {
                id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                phone: result.user.phone,
                role: result.user.role
            },
            doctor: {
                id: result.doctor._id,
                specialization:
                    result.doctor.specialization,
                department:
                    result.doctor.department,
                qualification:
                    result.doctor.qualification,
                experience:
                    result.doctor.experience,
                consultationFee:
                    result.doctor.consultationFee,
                licenseNumber:
                    result.doctor.licenseNumber
            }
        });
    } catch (error) {
        console.error(error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

const getDoctorsController = async (req,res) => {
    try {
        const {page, limit, search, specialization, department} = req.query;
        const rest = await getDoctors({
            page, limit, search, specialization, department
        });
        res.status(200).json({
            success: true,
            data: rest.doctors,
            pagination: rest.pagination
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: true,
            message: "Failed to fetch doctors"
        });
    }
};

const getDoctorByIdController = async (req,res) => {
    try {
        const doctor = await getDoctorById(req.params.id);
        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to fetch doctor"
        });
    }
};

const updateDoctorController = async (req,res) => {
    try {
        const doctor = await updateDoctor(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Updated successfully",
            data: doctor
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to update doctor"
        });
    }
};

const deactivateDoctorController = async (req,res) => {
    try {
        await deactivateDoctor(req.params.id);
        res.status(200).json({
            success: true,
            message: "Deactivated Successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: "Failed to deactivate the doctor"
        });
    }
};

module.exports = {createDoctorController, getDoctorsController, getDoctorByIdController, updateDoctorController, deactivateDoctorController};