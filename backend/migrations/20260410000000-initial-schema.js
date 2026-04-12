'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.STRING, allowNull: true },
      role: { type: Sequelize.ENUM('customer', 'driver', 'admin'), defaultValue: 'customer' },
      is_suspended: { type: Sequelize.BOOLEAN, defaultValue: false },
      auth_provider: { type: Sequelize.ENUM('local', 'google'), defaultValue: 'local' },
      verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      resetPasswordToken: { type: Sequelize.STRING, allowNull: true },
      resetPasswordExpire: { type: Sequelize.DATE, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('DriverProfiles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicleType: { type: Sequelize.STRING, allowNull: false },
      vehiclePlate: { type: Sequelize.STRING, allowNull: true },
      licenseNumber: { type: Sequelize.STRING, allowNull: false },
      nin: { type: Sequelize.STRING, allowNull: true },
      guarantor_name: { type: Sequelize.STRING, allowNull: true },
      guarantor_phone: { type: Sequelize.STRING, allowNull: true },
      guarantor_address: { type: Sequelize.STRING, allowNull: true },
      guarantor_nin: { type: Sequelize.STRING, allowNull: true },
      availability: { type: Sequelize.BOOLEAN, defaultValue: true },
      rating: { type: Sequelize.FLOAT, defaultValue: 0.0 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Shipments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      trackingNumber: { type: Sequelize.STRING, allowNull: false, unique: true },
      customerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      driverId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'Users', key: 'id' }
      },
      origin: { type: Sequelize.STRING, allowNull: false },
      destination: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM('pending', 'assigned', 'picked_up', 'in_transit', 'delivered'),
        defaultValue: 'pending',
      },
      distance: { type: Sequelize.FLOAT, defaultValue: 0.0 },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'paid'),
        defaultValue: 'pending',
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      productType: { type: Sequelize.STRING, allowNull: true },
      receiverName: { type: Sequelize.STRING, allowNull: false },
      receiverPhone: { type: Sequelize.STRING, allowNull: false },
      receiverAddress: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      key: { type: Sequelize.STRING, allowNull: false, unique: true },
      value: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      message: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, defaultValue: 'info' },
      isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Conversations', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      user1Id: { type: Sequelize.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
      user2Id: { type: Sequelize.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    await queryInterface.createTable('Messages', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
      conversationId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Conversations', key: 'id' } },
      senderId: { type: Sequelize.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
      text: { type: Sequelize.TEXT, allowNull: false },
      read: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
    await queryInterface.dropTable('Conversations');
    await queryInterface.dropTable('Notifications');
    await queryInterface.dropTable('Settings');
    await queryInterface.dropTable('Shipments');
    await queryInterface.dropTable('DriverProfiles');
    await queryInterface.dropTable('Users');
  }
};
