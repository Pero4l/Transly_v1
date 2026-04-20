const { DataTypes } = require("sequelize");
const db = require("../config/db");

const FoodOrder = db.define("FoodOrder", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  deliveryAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shipmentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Shipments',
      key: 'id'
    }
  }
});

module.exports = FoodOrder;
