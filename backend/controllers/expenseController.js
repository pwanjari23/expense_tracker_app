const Expense = require("../models/expense");

exports.addExpense = async (req, res) => {
  try {
    const { amount, title, category } = req.body;
    console.log("api logged addExpense", req.body);
    const userId = req.user.id; // From JWT

    if (!amount || !title || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = await Expense.create({
      amount,
      title,
      category,
      date: new Date(),
      userId,
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Error in addExpense:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("userID", userId);
    const expenses = await Expense.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    console.log(expenses, "expenses")
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteExpenseById = async (req, res) => {
  try {
    console.log("req.user in controller:", req.user);
    const { id } = req.params;
    const userId = req.user.id;

    if (!id) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this expense" });
    }

    await expense.destroy();

    res.status(200).json({
      message: "Expense deleted successfully",
      deletedId: id,
    });
  } catch (err) {
    console.error("Error deleting expense:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, title, category } = req.body;
    const userId = req.user.id;

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this expense" });
    }

    expense.amount = amount || expense.amount;
    expense.title = title || expense.title;
    expense.category = category || expense.category;

    await expense.save();

    res.status(200).json(expense);
  } catch (err) {
    console.error("Error updating expense:", err);
    res.status(500).json({ message: "Server error" });
  }
};
