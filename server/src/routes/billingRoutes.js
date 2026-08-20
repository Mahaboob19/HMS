const express = require("express");
const {protect, authorize} = require("../middleware/authMiddleware");
const {createBillController, getAllBillsController, getBillByIdController, getMyBillsController, recordPaymentController} = require("../controllers/billingController");
const router = express.Router();

router.post("/", protect, authorize("admin"), createBillController);
router.get("/", protect, authorize("admin"), getAllBillsController);
router.get("/my", protect, authorize("patient"), getMyBillsController);
router.get("/:id", protect, authorize("admin"), getBillByIdController);
router.put("/:id/payment", protect, authorize("admin"), recordPaymentController);

module.exports = router;