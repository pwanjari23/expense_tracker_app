const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const expenseController = require("../controllers/expenseController");

// Protect all routes with auth
router.use(authenticateToken);

// POST: Add expense
router.post("/addexpense", expenseController.addExpense);

// GET: Fetch user's expenses
router.get("/getExpenses", expenseController.getExpenses);

// DELETE: Delete by ID (own only)
router.delete("/delete/:id", expenseController.deleteExpenseById);

// PUT: Update by ID (own only)
router.put("/updateExpense/:id", expenseController.updateExpenseById);

module.exports = router;