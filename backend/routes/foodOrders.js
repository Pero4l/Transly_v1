const express = require('express');
const router = express.Router();
const { FoodOrder, FoodOrderItem, FoodItem, User } = require('../models');
const db = require('../config/db');

// POST /foodOrders - User places an order
router.post('/', async (req, res) => {
  // Ideally, use a transaction to ensure all or nothing
  const t = await db.transaction();
  try {
    const { userId, items, deliveryAddress } = req.body;
    // items should be an array: [{ foodItemId, quantity }, ...]

    if (!userId || !items || !items.length) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid order structure' });
    }

    let totalAmount = 0;
    const orderItemsToCreate = [];

    for (let item of items) {
      const foodItem = await FoodItem.findByPk(item.foodItemId, { transaction: t });
      if (!foodItem || !foodItem.isAvailable) {
        await t.rollback();
        return res.status(400).json({ message: `Food item ${item.foodItemId} is unavailable` });
      }

      const quantity = parseInt(item.quantity) || 1;
      const priceAtOrder = foodItem.price;
      
      totalAmount += (priceAtOrder * quantity);

      orderItemsToCreate.push({
        foodItemId: foodItem.id,
        quantity,
        priceAtOrder,
      });
    }

    // Create Order
    const foodOrder = await FoodOrder.create({
      userId,
      totalAmount,
      deliveryAddress,
      status: 'pending'
    }, { transaction: t });

    // Link Order Items
    for (let oi of orderItemsToCreate) {
      oi.orderId = foodOrder.id;
    }
    await FoodOrderItem.bulkCreate(orderItemsToCreate, { transaction: t });

    await t.commit();
    
    // fetch fully populated order
    const fullOrder = await FoodOrder.findByPk(foodOrder.id, {
      include: [{ model: FoodOrderItem, as: 'items', include: [{ model: FoodItem, as: 'foodItem' }] }]
    });

    res.status(201).json(fullOrder);
  } catch (err) {
    console.error(err);
    await t.rollback();
    res.status(500).json({ message: 'Server error placing order' });
  }
});

// GET /foodOrders/me - View my orders
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['userid'] || req.query.userId; // or get from auth token context
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const orders = await FoodOrder.findAll({
      where: { userId },
      include: [{ model: FoodOrderItem, as: 'items', include: [{ model: FoodItem, as: 'foodItem' }] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// GET /foodOrders - Admin view all orders
router.get('/', async (req, res) => {
  try {
    const orders = await FoodOrder.findAll({
      include: [
        { model: User },
        { model: FoodOrderItem, as: 'items', include: [{ model: FoodItem, as: 'foodItem' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching all orders' });
  }
});

// PUT /foodOrders/:id/status - Admin update order status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await FoodOrder.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await order.update({ status });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

module.exports = router;
