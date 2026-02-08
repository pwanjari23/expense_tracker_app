const { where, fn, col } = require("sequelize");
const Expense = require("../models/expense");
const DownloadedFile = require("../models/downloadedFile");
const { uploadToS3 } = require("../services/s3");
const { generateExpensePDF } = require("../services/reportGenerator");
const UserReport = require("../models/userReport");

// LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const userId = req.params.id;
    const getAllUserExpense = await Expense.findAll({
      attributes: ["category", [fn("SUM", col("amount")), "totalSpendAmout"]],
      where: { userId },
      group: ["category"],
    });

    res.json({ allUserExpense: getAllUserExpense, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

// DOWNLOAD ALL EXPENSES AS JSON
exports.downloadExpenses = async (req, res) => {
  try {
    if (!req.user.isPremium) {
      return res.status(403).json({ message: "Premium membership required" });
    }

    const userId = req.user.id;
    const expenses = await Expense.findAll({ where: { userId } });

    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }

    const fileContent = JSON.stringify(expenses, null, 2);
    const fileName = `expenses/user-${userId}/${Date.now()}.json`;
    const fileUrl = await uploadToS3(fileContent, fileName);

    await DownloadedFile.create({ fileUrl, userId });

    res.status(200).json({ fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Download failed" });
  }
};

// GET LIST OF PAST JSON DOWNLOADS
exports.getDownloadedFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await DownloadedFile.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch files" });
  }
};

// DOWNLOAD EXPENSE REPORT AS PDF
exports.getExpenseReport = async (req, res) => {
  try {
    console.log(req.user, "request");
  
    const userId = Number(req.params.id);
    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const expenses = await Expense.findAll({ where: { userId } });
    if (expenses.length === 0) {
      return res.status(404).json({ message: "No expenses found" });
    }

    // Generate PDF
    const pdfBuffer = await generateExpensePDF(expenses, userId);
    const fileName = `expense-reports/user-${userId}/expense-report-${Date.now()}.pdf`;
    const fileUrl = await uploadToS3(pdfBuffer, fileName, "application/pdf");

    // Save report metadata
    const report = await UserReport.create({
      userId,
      reportType: "EXPENSE",
      s3Url: fileUrl,
    });

    res.status(200).json({ success: true, reportUrl: report.s3Url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Report generation failed" });
  }
};

// BONUS: GET PAST PDF REPORTS
exports.getPastReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await UserReport.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
