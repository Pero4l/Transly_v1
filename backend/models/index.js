const sequelize = require('../config/db');
const User = require('./User');
const DriverProfile = require('./DriverProfile');
const Shipment = require('./Shipment');
const Setting = require('./Setting');
const Notification = require('./Notification');
const Conversation = require('./Conversation');
const Message = require('./Message');

// Associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(DriverProfile, { foreignKey: 'userId', as: 'driverProfile' });
DriverProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Shipment, { foreignKey: 'customerId', as: 'customerShipments' });
Shipment.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

User.hasMany(Shipment, { foreignKey: 'driverId', as: 'driverShipments' });
Shipment.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

User.hasMany(Conversation, { foreignKey: 'user1Id' });
User.hasMany(Conversation, { foreignKey: 'user2Id' });
Conversation.belongsTo(User, { as: 'user1', foreignKey: 'user1Id' });
Conversation.belongsTo(User, { as: 'user2', foreignKey: 'user2Id' });

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

const syncDB = async () => {
  await sequelize.sync({ alter: true });
  console.log('Database schemas synchronized.');
};

module.exports = { User, DriverProfile, Shipment, Setting, Notification, Conversation, Message, syncDB };

