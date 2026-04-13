const { User, DriverProfile, Shipment, Setting, Notification } = require('../models');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await User.findAll({ 
      where: { role: 'customer' },
      attributes: { exclude: ['password'] } 
    });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await User.findAll({ 
      where: { role: 'driver' },
      attributes: { exclude: ['password'] },
      include: [{ model: DriverProfile, as: 'driverProfile' }]
    });
    res.status(200).json({ success: true, drivers });
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
      sendEmail({
        email: driver.email,
        subject: 'New Shipment Assigned',
        message: `You have been assigned shipment ${shipment.trackingNumber}. Origin: ${shipment.origin}, Destination: ${shipment.destination}.`,
      }).catch(err => console.error('Background Email Error [Driver Assign]:', err.message));
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

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.status(200).json({ success: true, settings: settingsMap });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createDriver = async (req, res) => {
  const { name, email, phone, address, vehicleType, licenseNumber, nin, guarantor_name, guarantor_phone, guarantor_address, guarantor_nin } = req.body;
  
  if (!name || !email || !phone || !vehicleType || !licenseNumber) {
    return res.status(400).json({ success: false, error: 'Name, email, phone, vehicleType, and licenseNumber are required' });
  }

  try {
    const existing = await User.findOne({ where: { email }});
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });

    const generatedPassword = Math.random().toString(36).slice(-8); // Random password for manual drivers
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(generatedPassword, salt);

    const user = await User.create({
      name, email, phone, address, password: hashedPassword, role: 'driver'
    });

    await DriverProfile.create({
      userId: user.id, vehicleType, licenseNumber, nin, guarantor_name, guarantor_phone, guarantor_address, guarantor_nin
    });

    try {
      sendEmail({
        email: user.email,
        subject: 'Welcome to Transly Driver Team!',
        message: `You have been added. Password: ${generatedPassword}. Login to start.`
      }).catch(err => console.error('Background Email Error [Driver Created]:', err.message));
 
      await Notification.create({
        userId: user.id,
        message: `Welcome to the team! Your driver account is active.`,
        type: 'info'
      });
    } catch(err) {}

    res.status(201).json({ success: true, message: 'Driver created', driverId: user.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleSuspend = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    user.is_suspended = !user.is_suspended;
    await user.save();
    
    res.status(200).json({ success: true, is_suspended: user.is_suspended, message: `User suspension status is now ${user.is_suspended}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, email, phone, address, password } = req.body;
  
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, phone, and password are required' });
  }

  try {
    const existing = await User.findOne({ where: { email }});
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, phone, address, password: hashedPassword, role: 'admin'
    });

    res.status(201).json({ success: true, message: 'Admin created', adminId: user.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};