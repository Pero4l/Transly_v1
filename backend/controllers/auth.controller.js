const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Notification } = require('../models');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return res.status(400).json({ message: "Password must contain both uppercase and lowercase letters" });
  } else if (!/[0-9]/.test(password)) {
    return res.status(400).json({ message: "Password must contain a number" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  } else if (name.length < 5) {
    return res.status(400).json({ message: "Name must be at least 5 characters" });
  } else if (phone.length < 10) {
    return res.status(400).json({ message: "Phone number must be at least 10 digits long" });
  }

  try {
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'customer',
      phone,
    });

    sendEmail({
      email: user.email,
      subject: 'Welcome to Transly!',
      message: `Hello ${user.name},\n\nWelcome to Transly platform! Your account has been created successfully.\n\nBest,\nTransly Team`,
    }).catch(err => console.error('Background Email Error [Register]:', err.message));
 
    // Create in-app notification
    Notification.create({
      userId: user.id,
      message: `Welcome to Transly, ${user.name}! We are glad to have you here.`,
      type: 'success'
    }).catch(err => console.error('Background Notification Error [Register]:', err.message));

    // Store everything in Redis session (replacing localStorage)
    req.session.sessionData = {
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, error: "Failed to create session" });
      }
      res.status(201).json({
        success: true,
        ...req.session.sessionData
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Login attempt: ${email}`);

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Store everything in Redis session (replacing localStorage)
    req.session.sessionData = {
      token: generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      }
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session Save Error [Login]:", err);
        return res.status(500).json({ success: false, error: "Failed to persist session" });
      }
      res.status(200).json({
        success: true,
        ...req.session.sessionData
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      phone: req.user.phone,
      address: req.user.address,
    },
    token: req.headers.authorization ? req.headers.authorization.split(' ')[1] : (req.session?.sessionData?.token)
  });
};

exports.googleAuth = async (req, res) => {
  const { name, email, googleId, image } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: 'Google authentication failed to provide email' });
  }

  try {
    // NOTE: In a strictly secure production app, you should also verify the 
    // ID token (JWT) from Google using the 'google-auth-library' to prevent spoofing.
    let user = await User.findOne({ where: { email } });
    if (!user) {
      const generatedPassword = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        auth_provider: 'google',
        role: 'customer'
      });
    }

    // Store in session for Redis persistence
    req.session.sessionData = {
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address }
    };
 
    req.session.save((err) => {
      if (err) {
        console.error("Google Auth Session Error:", err);
      }
      res.status(200).json({
        success: true,
        ...req.session.sessionData
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, error: 'There is no user with that email' });

    const resetToken = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 char OTP
    const salt = await bcrypt.genSalt(10);
    user.resetPasswordToken = await bcrypt.hash(resetToken, salt);
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send email in background (non-blocking)
    sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      message: `Your password reset OTP is: ${resetToken}\nIt is valid for 10 minutes.`,
    }).catch(err => console.error('Background Email Error [ForgotPass]:', err.message));

    res.status(200).json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.resetPasswordToken || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordToken);
    if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid OTP' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { phone, address } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    user.phone = phone || user.phone;
    user.address = address || user.address;
    await user.save();

    res.status(200).json({ success: true, user: { phone: user.phone, address: user.address } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSession = async (req, res) => {
  console.log(`[AUTH] Checking session for ID: ${req.sessionID}`);
  if (req.session && req.session.sessionData) {
    console.log(`[AUTH] Session found for user: ${req.session.sessionData.user.email}`);
    res.status(200).json({ success: true, ...req.session.sessionData });
  } else {
    console.log(`[AUTH] No session found in Redis. Session object exists: ${!!req.session}`);
    res.status(401).json({ success: false, error: 'No active session in Redis' });
  }
};

exports.logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ success: false, error: 'Logout failed' });
    res.clearCookie('transly.sid');
    res.status(200).json({ success: true, message: 'Logged out from Redis session' });
  });
};
