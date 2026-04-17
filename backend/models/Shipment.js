const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
        isIn: [['pending', 'assigned', 'picked_up', 'in_transit', 'delivered']]
    }
  },
  distance: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
        isIn: [['pending', 'paid']]
    }
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  productType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  senderPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  receiverName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverAddress: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

module.exports = Shipment;
