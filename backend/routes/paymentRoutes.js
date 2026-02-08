const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/create-order", authenticateToken, paymentController.createOrder);
router.get("/order-status", paymentController.getPaymentStatus);

module.exports = router;
