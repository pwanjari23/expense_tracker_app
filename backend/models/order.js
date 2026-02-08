const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./user");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
    defaultValue: "PENDING",
  },
  paymentSessionId: {
    type: DataTypes.STRING,
  },
});

User.hasMany(Order);
Order.belongsTo(User); // Sequelize auto-creates UserId

module.exports = Order;
