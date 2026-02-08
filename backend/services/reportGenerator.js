const PDFDocument = require("pdfkit");

exports.generateExpensePDF = (expenses, userId) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Title
      doc.fontSize(20).text("Expense Report", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`User ID: ${userId}`);
      doc.text(`Generated At: ${new Date().toLocaleString()}`);
      doc.moveDown(2);

      // Table Header
      doc.font("Helvetica-Bold");
      doc.text("Date", 40);
      doc.text("Title", 120);
      doc.text("Category", 300);
      doc.text("Amount", 450);
      doc.moveDown();

      doc.font("Helvetica");

      let total = 0;

      expenses.forEach((exp) => {
        total += Number(exp.amount);

        doc.text(new Date(exp.date).toLocaleDateString(), 40);
        doc.text(exp.title, 120);
        doc.text(exp.category, 300);
        doc.text(`₹ ${exp.amount}`, 450);
        doc.moveDown();
      });

      doc.moveDown(2);
      doc.font("Helvetica-Bold").text(`Total Spent: ₹ ${total}`, {
        align: "right",
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
