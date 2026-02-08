const { Sequelize } = require("sequelize");
const path = require("path");

// Load .env from the backend folder explicitly
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,

    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;