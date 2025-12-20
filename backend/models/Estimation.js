// backend/models/Estimation.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Estimation = sequelize.define("Estimation", {
  estimateNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerContact: {
    type: DataTypes.STRING,
  },
  customerAddress: {
    type: DataTypes.STRING,
  },
  totalItems: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  grandTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

const EstimationItem = sequelize.define("EstimationItem", {
  plantName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

// ✅ Associations
Estimation.hasMany(EstimationItem, {
  as: "items",
  foreignKey: "estimationId",
  onDelete: "CASCADE",
});
EstimationItem.belongsTo(Estimation, { foreignKey: "estimationId" });

module.exports = { Estimation, EstimationItem };
