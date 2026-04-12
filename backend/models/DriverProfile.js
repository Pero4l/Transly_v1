const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DriverProfile = sequelize.define('DriverProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  vehicleType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehiclePlate: {
    type: DataTypes.STRING,
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guarantor_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guarantor_phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guarantor_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  guarantor_nin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  timestamps: true,
});

module.exports = DriverProfile;
