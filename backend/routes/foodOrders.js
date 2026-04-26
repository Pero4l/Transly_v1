const express = require('express');
const router = express.Router();
const { FoodOrder, FoodOrderItem, FoodItem, User, Shipment, Setting, Notification } = require('../models');
// Ensure Setting is imported correctly to avoid ReferenceError on some environments
const db = require('../config/db');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeAdmin } = require('../middlewares/adminMiddleware');
const sendEmail = require('../utils/sendEmail');
const { buildNotificationTemplate } = require('../utils/emailTemplates');
const { getIO } = require('../config/socket');

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
    
    // Try to get specific food settings first
    let pricePerKmSetting = await Setting.findOne({ where: { key: 'FOOD_PRICE_PER_KM' } });
    let baseFareSetting = await Setting.findOne({ where: { key: 'FOOD_BASE_FARE' } });

    // Fallback to old generic settings if specific ones don't exist
    if (!pricePerKmSetting) pricePerKmSetting = await Setting.findOne({ where: { key: 'PRICE_PER_MILE' } });
    if (!baseFareSetting) baseFareSetting = await Setting.findOne({ where: { key: 'BASE_FARE' } });
    
    const rate = pricePerKmSetting ? parseFloat(pricePerKmSetting.value) : 200;
    const base = baseFareSetting ? parseFloat(baseFareSetting.value) : 100;
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
      senderName: "Transly Kitchen",
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

    res.status(201).json({
      success: true,
      order: fullOrder,
      shipmentId: shipment.id
    });

    // --- NOTIFICATIONS ---
    try {
      const admin = await User.findOne({ where: { role: 'admin' } });
      const adminEmail = admin ? admin.email : "translynigeria@gmail.com";

      // 1. Notify Admin (Email)
      sendEmail({
        email: adminEmail,
        subject: "New Food Order Received",
        html: buildNotificationTemplate("New Food Order", `Hello Admin,\n\nA new food order (${trackingNumber}) has been placed by ${user.name}.\n\nTotal Amount: ₦${totalAmount.toFixed(2)}\nDelivery Address: ${deliveryAddress}\n\nPlease check the admin dashboard to process this order.\n\nBest regards,\nTransly System Automation`)
      }).catch(err => console.error('BG Email Error [Admin Food Order]:', err.message));

      // 2. Notify Customer (Email)
      sendEmail({
        email: user.email,
        subject: "Food Order Confirmed",
        html: buildNotificationTemplate("Order Confirmed", `Dear ${user.name},\n\nYour food order has been successfully placed! Our kitchen is now preparing and packaging your delicious meal.\n\nOrder Tracking Number: ${trackingNumber}\nTotal Amount: ₦${totalAmount.toFixed(2)}\n\nYou can track your delivery in real-time from your dashboard. Thank you for choosing Transly Food!\n\nWarm regards,\nThe Transly Team`)
      }).catch(err => console.error('BG Email Error [Customer Food Order]:', err.message));

      // 3. In-App Notifications
      await Notification.create({
        userId: userId,
        message: `Your food order ${trackingNumber} has been placed successfully.`,
        type: 'success'
      });

      if (admin) {
        await Notification.create({
          userId: admin.id,
          message: `New food order ${trackingNumber} placed by ${user.name}`,
          type: 'info'
        });
      }

      // 4. Socket Notifications
      getIO().to(userId).emit('notification', {
        message: `Your food order ${trackingNumber} is being prepared!`,
        type: 'success',
        createdAt: new Date()
      });

      getIO().emit('admin_notification', {
        message: `New food order: ${trackingNumber}`,
        type: 'info'
      });

    } catch (notifErr) {
      console.error('Failed to send food order notifications:', notifErr.message);
    }

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
    
    // --- STATUS UPDATE NOTIFICATIONS ---
    try {
      const customer = await User.findByPk(order.userId);
      const shipment = await Shipment.findByPk(order.shipmentId);

      if (customer) {
        // 1. Notify Customer (Email)
        sendEmail({
          email: customer.email,
          subject: `Food Order Update: ${status}`,
          html: buildNotificationTemplate(`Food Order: ${status}`, `Dear ${customer.name},\n\nYour food order (${shipment?.trackingNumber || 'N/A'}) status has been updated to: ${status}.\n\nThank you for choosing Transly Food!\n\nWarm regards,\nThe Transly Team`)
        }).catch(err => console.error('BG Email Error [Food Status Update]:', err.message));

        // 2. In-App Notification
        await Notification.create({
          userId: customer.id,
          message: `Your food order status is now: ${status}`,
          type: 'info'
        });

        // 3. Socket Notification
        getIO().to(customer.id).emit('notification', {
          message: `Order update: Your food is now ${status}!`,
          type: 'info',
          createdAt: new Date()
        });
      }

      // Notify Admins (Email)
      sendEmail({
        email: "translynigeria@gmail.com",
        subject: `Food Order Status Changed: ${status}`,
        html: buildNotificationTemplate("Order Status Update", `Hello Admin,\n\nThe status of food order ${shipment?.trackingNumber || 'N/A'} for user ${customer?.name || 'Unknown'} has been changed to: ${status}.\n\nBest regards,\nTransly System Automation`)
      }).catch(err => console.error('BG Email Error [Admin Food Status Update]:', err.message));

    } catch (notifErr) {
      console.error('Failed to send food status notifications:', notifErr.message);
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

module.exports = router;
