const express = require('express');
const router = express.Router();
const { FoodOrder, FoodOrderItem, FoodItem, User } = require('../models');
const db = require('../config/db');

// POST /foodOrders - User places an order
router.post('/', async (req, res) => {
  const t = await db.transaction();
  try {
    const { userId, items, deliveryAddress, deliveryType, receiverName, receiverPhone } = req.body;
    // deliveryType: 'self' or 'third_party'

    if (!userId || !items || !items.length || !deliveryAddress) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid order structure or missing delivery address' });
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'User not found' });
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

    // 1. Create the Shipment first
    const { Shipment } = require('../models');
    const trackingNumber = `FOOD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const shipment = await Shipment.create({
      trackingNumber,
      customerId: userId,
      origin: "Transly HQ, Lagos", // Default origin for food
      destination: deliveryAddress,
      receiverAddress: deliveryAddress,
      receiverName: deliveryType === 'self' ? user.name : (receiverName || "Third Party"),
      receiverPhone: deliveryType === 'self' ? user.phone : (receiverPhone || "N/A"),
      senderName: "Transly Kitchen",
      senderPhone: "0800-TRANSLY",
      productType: "Food",
      description: `Food Order for ${items.length} items`,
      status: 'pending',
      paymentStatus: 'pending', // Assuming payment happens separately or via this order total
      price: 0 // Shipment price might be built into food price or calculated later
    }, { transaction: t });

    // 2. Create the Food Order linked to the shipment
    const foodOrder = await FoodOrder.create({
      userId,
      totalAmount,
      deliveryAddress,
      status: 'pending',
      shipmentId: shipment.id
    }, { transaction: t });

    // 3. Create the Order Items
    for (let oi of orderItemsToCreate) {
      oi.orderId = foodOrder.id;
    }
    await FoodOrderItem.bulkCreate(orderItemsToCreate, { transaction: t });

    await t.commit();
    
    // fetch fully populated order
    const fullOrder = await FoodOrder.findByPk(foodOrder.id, {
      include: [
        { model: Shipment, as: 'shipment' },
        { model: FoodOrderItem, as: 'items', include: [{ model: FoodItem, as: 'foodItem' }] }
      ]
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
