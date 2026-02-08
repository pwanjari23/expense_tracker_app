const express = require("express");
const { callAiModal } = require("../controllers/aiController");
const router = express.Router();

router.post("/callai",callAiModal);

module.exports = router;