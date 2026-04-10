const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DriverProfile = sequelize.define('DriverProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  vehicleType: {
    type: DataTypes.STRING,
  },
  vehiclePlate: {
    type: DataTypes.STRING,
  },
  licenseNumber: {
    type: DataTypes.STRING,
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
});

module.exports = DriverProfile;
