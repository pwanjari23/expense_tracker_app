const { Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = require("./user");
const Expense = require("./expense");
const DownloadedFile = require("./downloadedFile");
const UserReport = require("./userReport");

User.hasMany(UserReport);
UserReport.belongsTo(User);

module.exports = {
  sequelize,
  User,
  Expense,
  DownloadedFile,
  UserReport,
};
