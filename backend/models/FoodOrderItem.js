const { DataTypes } = require("sequelize");
const db = require("../config/db");

const FoodOrderItem = db.define("FoodOrderItem", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  priceAtOrder: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
});

module.exports = FoodOrderItem;
