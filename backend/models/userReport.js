const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const UserReport = sequelize.define(
  "UserReport",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    reportType: { type: DataTypes.STRING, allowNull: false }, // EXPENSE
    s3Url: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: true },
);

module.exports = UserReport;
