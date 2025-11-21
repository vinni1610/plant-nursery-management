// backend/models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// -------------------
// Order model
// -------------------
const Order = sequelize.define("Order", {
  orderNo: { type: DataTypes.STRING, allowNull: false },
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerContact: DataTypes.STRING,
  customerAddress: { type: DataTypes.STRING },  // ✅ NEW FIELD
  subTotal: DataTypes.FLOAT,
  tax: {
    type: DataTypes.FLOAT,
    defaultValue: 0, // ✅ No tax now
  },
  grandTotal: DataTypes.FLOAT,
  paidAmount: DataTypes.FLOAT,
  status: {
    type: DataTypes.ENUM("Paid", "Pending", "Cancelled"),
    defaultValue: "Paid",
  },
});

// -------------------
// OrderItem model
// -------------------
const OrderItem = sequelize.define("OrderItem", {
  plantName: DataTypes.STRING,
  rate: DataTypes.FLOAT,
  quantity: DataTypes.INTEGER,
  total: DataTypes.FLOAT,
});

module.exports = { Order, OrderItem };
