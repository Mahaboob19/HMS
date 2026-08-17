const express = require("express");
const {protect, authorize} = require("../middleware/authMiddleware");
const {createAppointmentController, getMyAppointmentController, getDoctorAppointmentsController, confirmAppointmentController, rejectAppointmentController, completeAppointmentController, cancelAppointmentController, getDoctorAvailabilityController} = require("../controllers/appointmentController");
const { create } = require("../models/Patient");
const router = express.Router();

router.post("/", protect, authorize("patient"), createAppointmentController);
router.get("/my", protect, authorize("patient"), getMyAppointmentController);
router.get("/doctor", protect, authorize("doctor"), getDoctorAppointmentsController);
router.get("/availability", getDoctorAvailabilityController);
router.put("/:id/confirm", protect, authorize("doctor"), confirmAppointmentController);
router.put("/:id/reject", protect, authorize("doctor"), rejectAppointmentController);
router.put("/:id/complete", protect, authorize("doctor"), completeAppointmentController);
router.put("/:id/cancel", protect, authorize("patient"), cancelAppointmentController);

module.exports = router;