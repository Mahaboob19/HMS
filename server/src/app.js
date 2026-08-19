const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res) => {
    res.json({
        success: true,
        message: "HMS API is running"
    });
});

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/doctors",doctorRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

module.exports = app;