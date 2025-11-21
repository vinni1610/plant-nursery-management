// backend/models/index.js
const sequelize = require("../config/db");
const Plant = require("./Plant");
const { Order, OrderItem } = require("./Order");

// ✅ Define associations (only once)
Order.hasMany(OrderItem, { as: "orderItems", foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Plant.hasMany(OrderItem, { foreignKey: "plantId", onDelete: "SET NULL" });
OrderItem.belongsTo(Plant, { foreignKey: "plantId" });

module.exports = { sequelize, Plant, Order, OrderItem };
