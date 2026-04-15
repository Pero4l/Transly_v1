const { Shipment, User, DriverProfile, Setting, Notification } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { buildNotificationTemplate } = require('../utils/emailTemplates');
const { getIO } = require('../config/socket');

const DEFAULT_PRICE_PER_MILE = 500.0;
const DEFAULT_BASE_FARE = 1500.0;

const calculatePrice = async (distance) => {
  try {
    let priceSetting = await Setting.findOne({ where: { key: 'PRICE_PER_MILE' } });
    let baseSetting = await Setting.findOne({ where: { key: 'BASE_FARE' } });
    
    let rate = priceSetting ? parseFloat(priceSetting.value) : DEFAULT_PRICE_PER_MILE;
    let base = baseSetting ? parseFloat(baseSetting.value) : DEFAULT_BASE_FARE;
    
    if (isNaN(rate)) rate = DEFAULT_PRICE_PER_MILE;
    if (isNaN(base)) base = DEFAULT_BASE_FARE;
    
    return (base + (distance * rate)).toFixed(2);
  } catch (err) {
    console.error('Price calculation error:', err);
    return (DEFAULT_BASE_FARE + (distance * DEFAULT_PRICE_PER_MILE)).toFixed(2);
  }
};

exports.createShipment = async (req, res) => {
  const { 
    origin, 
    destination, 
    distance,
    description,
    productType,
    receiverName,
    receiverPhone,
    receiverAddress
  } = req.body;
  try {
    const trackingNumber = 'TRK-' + Math.floor(100000 + Math.random() * 900000);
    const price = await calculatePrice(distance || 0);

    const shipment = await Shipment.create({
      trackingNumber,
      customerId: req.user.id,
      origin,
      destination,
      distance: distance || 0,
      price,
      description,
      productType,
      receiverName,
      receiverPhone,
      receiverAddress
    });

    try {
      let admin = await User.findOne({ where: { role: 'admin' } });
      const adminEmail = admin ? admin.email : "translynigeria@gmail.com";
      
      // Notify admins via email (general address)
      sendEmail({
        email: adminEmail,
        subject:"New Shipment Created",
        html: buildNotificationTemplate("New Shipment Created", `Hello Admin,\n\nA new shipment has been successfully created on the platform by customer ${req.user.name} (Phone: ${req.user.phone}).\n\nShipment tracking number: ${trackingNumber}\nTotal quoted price: ₦${price}\n\nPlease review the shipment details and ensure a driver is assigned promptly from the administrative panel.\n\nBest regards,\nTransly System Automation`)
      }).catch(err => console.error('Background Email Error [Admin Notify]:', err.message));

      // Notify customer
      sendEmail({
        email: req.user.email,
        subject: 'Shipment Created',
        html: buildNotificationTemplate('Shipment Created', `Dear ${req.user.name},\n\nThank you for choosing Transly! Your shipment order has been successfully created and is now logged in our system.\n\nYour official Tracking Number is: ${trackingNumber}\nThe total estimated price for this shipment is: ₦${price}\n\nYou can use this tracking number to monitor your package's progress in real-time from your customer dashboard. We will notify you as soon as a driver is assigned to your order.\n\nWarm regards,\nThe Transly Team`),
      }).catch(err => console.error('Background Email Error [Customer Notify]:', err.message));
      
      // Create in-app notification
      await Notification.create({
        userId: req.user.id,
        message: `Shipment ${trackingNumber} created successfully.`,
        type: 'success'
      });
 
      // Emit socket notification to customer
      getIO().to(req.user.id).emit('notification', {
        message: `Shipment ${trackingNumber} created successfully.`,
        type: 'success',
        createdAt: new Date()
      });

      // Notify all Admins (In-app)
      const admins = await User.findAll({ where: { role: 'admin' } });
      for (const admin of admins) {
          await Notification.create({
              userId: admin.id,
              message: `New shipment ${trackingNumber} created by ${req.user.name}`,
              type: 'info'
          });
      }

      // Emit socket notification to all admins
      getIO().emit('admin_notification', {
        message: `New shipment: ${trackingNumber} by ${req.user.name}`,
        type: 'info'
      });
      
    } catch(err) { console.error('Failed to send notifications:', err); }

    res.status(201).json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMyShipments = async (req, res) => {
  try {
    const whereClause = req.user.role === 'driver' 
      ? { driverId: req.user.id } 
      : { customerId: req.user.id };

    const shipments = await Shipment.findAll({ where: whereClause, include: [{ model: User, as: 'driver', attributes: ['name', 'phone'] }] });
    res.status(200).json({ success: true, shipments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is strictly required to update shipment logistics tracking' });
  }

  try {
    const shipment = await Shipment.findByPk(id, { include: [{ model: User, as: 'customer' }] });
    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

    // Validate driver authorization
    if (req.user.role === 'driver' && shipment.driverId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized for this shipment' });
    }

    shipment.status = status;
    await shipment.save();

    const admin = await User.findAll({ where: { role: "admin" } });

    try {
      // For Customer
      sendEmail({
        email: shipment.customer.email,
        subject: `Shipment Update: ${status}`,
        html: buildNotificationTemplate(`Shipment Update: ${status}`, `Dear ${shipment.customer.name},\n\nWe are writing to inform you of a status update regarding your recent order with Transly.\n\nThe status of your shipment (Tracking Number: ${shipment.trackingNumber}) has been updated to: ${status}.\n\nThank you for trusting us with your logistics needs. You can track further updates directly from your dashboard.\n\nWarm regards,\nThe Transly Team`),
      }).catch(err => console.error('Background Email Error [Status update Customer]:', err.message));

      // For Admins (Email)
      sendEmail({
        email: "translynigeria@gmail.com",
        subject: `Shipment Update: ${status}`,
        html: buildNotificationTemplate(`Shipment Update: ${status}`, `Hello Admin,\n\nThis is a system notification detailing a recent shipment status change.\n\nThe shipment ${shipment.trackingNumber} belonging to customer ${shipment.customer.name} has had its status updated to: ${status}.\n\nPlease ensure this transition reflects correctly in the dispatch logs.\n\nBest regards,\nTransly System Automation`)
      }).catch(err => console.error('Background Email Error [Status update Admin]:', err.message));

      // Notify customer (In-app)
      await Notification.create({
        userId: shipment.customer.id,
        message: `Shipment ${shipment.trackingNumber} status updated to ${status}.`,
        type: 'info'
      });

      // Socket notification to customer
      getIO().to(shipment.customer.id).emit('notification', {
        message: `Your shipment ${shipment.trackingNumber} is now ${status}.`,
        type: 'info',
        createdAt: new Date()
      });

      // Notify all Admins (In-app)
      const admins = await User.findAll({ where: { role: 'admin' } });
      for (const admin of admins) {
        await Notification.create({
          userId: admin.id,
          message: `Shipment ${shipment.trackingNumber} status updated to ${status}.`,
          type: 'info'
        });
      }

      // Socket notification for Admins
      getIO().emit('admin_notification', {
        message: `Shipment ${shipment.trackingNumber} status updated to ${status}.`,
        type: 'info'
      });
    } catch(err) { console.error('Failed to send notifications:', err); }

    res.status(200).json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findByPk(req.params.id, {
      include: [
        { model: User, as: 'driver', attributes: ['name', 'phone'] },
        { model: User, as: 'customer', attributes: ['name', 'phone', 'email'] }
      ]
    });

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    // Authorization check: Admin can see all, Customer/Driver see only theirs
    if (req.user.role !== 'admin' && shipment.customerId !== req.user.id && shipment.driverId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this shipment' });
    }

    res.status(200).json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.trackShipment = async (req, res) => {
  const { trackingNumber } = req.params;
  try {
    const shipment = await Shipment.findOne({
      where: { trackingNumber },
      attributes: ['trackingNumber', 'status', 'origin', 'destination', 'updatedAt']
    });

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Tracking number not found' });
    }

    res.status(200).json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
