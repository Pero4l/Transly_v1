const { Shipment, User, DriverProfile, Setting, Notification } = require('../models');
const sendEmail = require('../utils/sendEmail');
const { getIO } = require('../config/socket');

const calculatePrice = async (distance) => {
  let priceSetting = await Setting.findOne({ where: { key: 'PRICE_PER_MILE' } });
  let rate = priceSetting ? parseFloat(priceSetting.value) : 500.0; // default ₦500/mile
  return (distance * rate).toFixed(2);
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
        message: `A new shipment has been created by ${req.user.name} with the phone number ${req.user.phone}. Tracking Number: ${trackingNumber}. Price: ₦${price}`
      }).catch(err => console.error('Background Email Error [Admin Notify]:', err.message));

      // Notify customer
      sendEmail({
        email: req.user.email,
        subject: 'Shipment Created',
        message: `Your shipment has been created successfully. Tracking Number: ${trackingNumber}. Price: ₦${price}`,
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
        message: `Your shipment ${shipment.trackingNumber} status is now: ${status}`,
      }).catch(err => console.error('Background Email Error [Status update Customer]:', err.message));

      // For Admins (Email)
      sendEmail({
        email: "translynigeria@gmail.com",
        subject: `Shipment Update: ${status}`,
        message: `A shipment ${shipment.trackingNumber} for ${shipment.customer.name} status is now: ${status}`
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
