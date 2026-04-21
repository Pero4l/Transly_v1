'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing tables if they exist to avoid type mismatches
    await queryInterface.dropTable('FoodOrderItems', { cascade: true }).catch(() => {});
    await queryInterface.dropTable('FoodOrders', { cascade: true }).catch(() => {});
    await queryInterface.dropTable('FoodItems', { cascade: true }).catch(() => {});

    // Create FoodItems table
    await queryInterface.createTable('FoodItems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Create FoodOrders table
    await queryInterface.createTable('FoodOrders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
        defaultValue: 'pending',
      },
      deliveryAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipmentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'Shipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });

    // Create FoodOrderItems table
    await queryInterface.createTable('FoodOrderItems', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FoodOrders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      foodItemId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'FoodItems',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      priceAtOrder: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FoodOrderItems');
    await queryInterface.dropTable('FoodOrders');
    await queryInterface.dropTable('FoodItems');
  }
};
