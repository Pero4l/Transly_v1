const express = require('express');
const router = express.Router();
const { FoodOrder, FoodOrderItem, FoodItem, User, Shipment, Setting } = require('../models');
// Ensure Setting is imported correctly to avoid ReferenceError on some environments
const db = require('../config/db');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeAdmin } = require('../middlewares/adminMiddleware');

// POST /foodOrders - User places an order
router.post('/', protect, async (req, res) => {
  const t = await db.transaction();
  try {
    const { items, deliveryAddress, deliveryType, receiverName, receiverPhone } = req.body;
    const userId = req.user.id;
    // deliveryType: 'self' or 'third_party'

    if (!items || !items.length || !deliveryAddress) {
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

    // 1. Fetch Food Settings (Origin and Delivery Fee logic)
    const foodOriginSetting = await Setting.findOne({ where: { key: 'FOOD_ORIGIN_LOCATION' } });
    const origin = foodOriginSetting ? foodOriginSetting.value : "Transly Kitchen, Jos";

    const trackingNumber = 'FOOD-' + Math.floor(100000 + Math.random() * 900000);
    
    // Calculate delivery fee if distance is provided
    const distanceParam = req.body.distance || 0;
    const pricePerMileSetting = await Setting.findOne({ where: { key: 'PRICE_PER_MILE' } });
    const baseFareSetting = await Setting.findOne({ where: { key: 'BASE_FARE' } });
    
    const rate = pricePerMileSetting ? parseFloat(pricePerMileSetting.value) : 50;
    const base = baseFareSetting ? parseFloat(baseFareSetting.value) : 500;
    const deliveryFee = (base + (distanceParam * rate));
    
    totalAmount += deliveryFee;

    const shipment = await Shipment.create({
      trackingNumber,
      customerId: userId,
      origin: origin,
      destination: deliveryAddress,
      distance: distanceParam,
      receiverAddress: deliveryAddress,
      receiverName: deliveryType === 'self' ? user.name : (receiverName || "Third Party"),
      receiverPhone: deliveryType === 'self' ? user.phone : (receiverPhone || "N/A"),
      senderName: "Transly",
      senderPhone: "0800-TRANSLY",
      senderEmail: "translynigeria@gmail.com",
      productType: "Food",
      description: `Food Order for ${items.length} items`,
      status: 'pending',
      paymentStatus: 'pending',
      price: deliveryFee // Store delivery fee in shipment price
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
router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id;
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
router.get('/', protect, authorizeAdmin, async (req, res) => {
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
router.put('/:id/status', protect, authorizeAdmin, async (req, res) => {
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
