const express = require("express");
const {protect,authorize} = require("../middleware/authMiddleware");
const {createDoctorController, getDoctorsController, getDoctorByIdController, updateDoctorController, deactivateDoctorController} = require("../controllers/doctorController");

const router = express.Router();

router.get("/", getDoctorsController);
router.get("/:id", getDoctorByIdController);
router.post("/",protect,authorize("admin"),createDoctorController);
router.put("/:id", protect, authorize("admin"), updateDoctorController);
router.delete("/:id", protect, authorize("admin"), deactivateDoctorController);

module.exports = router;