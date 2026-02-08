const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize"); // your Sequelize instance
const User = require("./user");

const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Relationship: Many ForgotPasswordRequests belong to one User
ForgotPasswordRequest.belongsTo(User, { foreignKey: "userId" });

module.exports = ForgotPasswordRequest;
