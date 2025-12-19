const sequelize = require("../config/db");
const Plant = require("./Plant");
const { Order, OrderItem } = require("./Order");
const { Estimation, EstimationItem } = require("./Estimation");

// Orders
Order.hasMany(OrderItem, { as: "orderItems", foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// OrderItems <-> Plant (THE MISSING LINK)
OrderItem.belongsTo(Plant, { as: "plant", foreignKey: "plantId" });
Plant.hasMany(OrderItem, { foreignKey: "plantId" });

// Estimations
Estimation.hasMany(EstimationItem, { as: "estimationItems", foreignKey: "estimationId" });
EstimationItem.belongsTo(Estimation, { foreignKey: "estimationId" });

// EstimationItems <-> Plant
EstimationItem.belongsTo(Plant, { as: "plant", foreignKey: "plantId" });
Plant.hasMany(EstimationItem, { foreignKey: "plantId" });

module.exports = {
  sequelize,
  Plant,
  Order,
  OrderItem,
  Estimation,
  EstimationItem,
};