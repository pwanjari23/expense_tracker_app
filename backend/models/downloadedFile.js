const sequelize = require("../config/sequelize");
const { DataTypes } = require("sequelize");

const DownloadedFile = sequelize.define(
  "DownloadedFile",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = DownloadedFile;
