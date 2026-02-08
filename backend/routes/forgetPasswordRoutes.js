const express = require("express");
const router = express.Router();
const forgetPasswordController = require("../controllers/forgetPasswordController");

router.post("/forgotpassword", forgetPasswordController.forgetPassword);
router.post("/resetpassword/:id", forgetPasswordController.resetPassword);


module.exports = router;
