const express = require("express");
const {createPatientController, getMyProfileController, updateMyProfileController} = require("../controllers/patientController");
const {protect, authorize} = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", createPatientController);
router.get("/me",protect, authorize("patient"),getMyProfileController);
router.put("/me", protect, authorize("patient"), updateMyProfileController);

module.exports = router;
