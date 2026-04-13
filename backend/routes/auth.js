const express = require('express');
const { register, login, getMe, googleAuth, forgotPassword, resetPassword, updateProfile, getSession, logout } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/session', getSession);
router.post('/logout', logout);
router.put('/profile', protect, updateProfile);

module.exports = router;
