const express = require("express");
const path = require("path");
const fs = require("fs"); // <-- needed for write streams
const morgan = require('morgan');
const logger = require('./logger'); // Winston logger for errors

const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const premiumFeatureRoute = require("./routes/premiumFeatureRoute");
const aiRoutes = require("./routes/aiRoutes");
const forgetPasswordRoutes = require("./routes/forgetPasswordRoutes");

const app = express();

// --------------------
// Create logs directory if it doesn't exist
// --------------------
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// --------------------
// Morgan setup for logging HTTP requests
// --------------------
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' } // append mode
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests to console (dev)
app.use(morgan('dev'));

// Log requests to file
app.use(morgan('combined', { stream: accessLogStream }));

// app.use(express.static(path.join(__dirname, "../Frontend/public")));

app.use(express.static(path.join(__dirname, "../frontend/public")));

// --------------------
// API routes
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/premium", premiumFeatureRoute);
app.use("/api/callAi", aiRoutes);
app.use("/api/password", forgetPasswordRoutes);

// --------------------
// Serve frontend pages
// --------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/public/dashboard.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/public/login.html"));
});

app.get("/password/resetpassword/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/public/login/resetpassword.html"));
});

// --------------------
// Error handling middleware
// --------------------
app.use((err, req, res, next) => {
  // Log the error to error.log using Winston
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Respond with error message
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
