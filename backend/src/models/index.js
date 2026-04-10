const { sequelize } = require('../config/db');
const User = require('./User');
const DriverProfile = require('./DriverProfile');
const Shipment = require('./Shipment');
const Setting = require('./Setting');
const Notification = require('./Notification');

// Associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(DriverProfile, { foreignKey: 'userId', as: 'driverProfile' });
DriverProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Shipment, { foreignKey: 'customerId', as: 'customerShipments' });
Shipment.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Shipment, { foreignKey: 'driverId', as: 'driverShipments' });
Shipment.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log('Database schemas synchronized.');
};

module.exports = { User, DriverProfile, Shipment, Setting, Notification, syncDB };
