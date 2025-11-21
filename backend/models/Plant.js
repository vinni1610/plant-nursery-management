const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Plant = sequelize.define("Plant", {
  plantName: { type: DataTypes.STRING, allowNull: false },
  botanicalName: DataTypes.STRING,
  description: DataTypes.TEXT,
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  size: DataTypes.STRING,
  light: DataTypes.STRING,
  water: DataTypes.STRING,
  category: DataTypes.STRING,
  image: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active",
  },
});

module.exports = Plant;
