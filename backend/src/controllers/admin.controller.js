const { User, DriverProfile, Shipment, Setting, Notification } = require('../models');
const sendEmail = require('../utils/sendEmail');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.findAll();
    res.status(200).json({ success: true, shipments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.assignDriver = async (req, res) => {
  const { shipmentId, driverId } = req.body;
  try {
    const shipment = await Shipment.findByPk(shipmentId);
    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });

    const driver = await User.findOne({ where: { id: driverId, role: 'driver' } });
    if (!driver) return res.status(404).json({ success: false, error: 'Driver not found' });

    shipment.driverId = driverId;
    shipment.status = 'assigned';
    await shipment.save();

    try {
      await sendEmail({
        email: driver.email,
        subject: 'New Shipment Assigned',
        message: `You have been assigned shipment ${shipment.trackingNumber}. Origin: ${shipment.origin}, Destination: ${shipment.destination}.`,
      });
      await Notification.create({
        userId: driver.id,
        message: `You have been assigned shipment ${shipment.trackingNumber}.`,
        type: 'info'
      });
    } catch(err) {}

    res.status(200).json({ success: true, shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  const { key, value } = req.body;
  try {
    let setting = await Setting.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key, value });
    }
    res.status(200).json({ success: true, setting });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
