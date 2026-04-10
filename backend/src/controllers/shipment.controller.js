const { Shipment, User, DriverProfile, Setting, Notification } = require('../models');
const sendEmail = require('../utils/sendEmail');

const calculatePrice = async (distance) => {
  let priceSetting = await Setting.findOne({ where: { key: 'PRICE_PER_MILE' } });
  let rate = priceSetting ? parseFloat(priceSetting.value) : 1.5; // default $1.5/mile
  return (distance * rate).toFixed(2);
};

exports.createShipment = async (req, res) => {
  const { origin, destination, distance } = req.body;
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
    });

    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Shipment Created',
        message: `Your shipment has been created successfully. Tracking Number: ${trackingNumber}. Price: $${price}`,
      });
      await Notification.create({
        userId: req.user.id,
        message: `Shipment ${trackingNumber} created successfully.`,
        type: 'success'
      });
      console.log('Customer notified of new shipment');
    } catch(err) { console.error('Failed to send email:', err); }

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

    try {
      await sendEmail({
        email: shipment.customer.email,
        subject: `Shipment Update: ${status}`,
        message: `Your shipment ${shipment.trackingNumber} status is now: ${status}`,
      });
      await Notification.create({
        userId: shipment.customer.id,
        message: `Shipment ${shipment.trackingNumber} status updated to ${status}.`,
        type: 'info'
      });
    } catch(err) { console.error('Failed to send email:', err); }

    res.status(200).json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
