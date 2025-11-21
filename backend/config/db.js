const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'nurserydb',
  process.env.DB_USER || 'nurseryuser',
  process.env.DB_PASS || 'nursery123',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
