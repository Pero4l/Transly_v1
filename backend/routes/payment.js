const express = require('express');
const router = express.Router();
const { initializeTransaction, verifyTransaction, paystackWebhook } = require('../controllers/payment.controller');
const { protect } = require('../middlewares/authMiddleware');

router.post('/initialize', protect, initializeTransaction);
router.post('/verify', protect, verifyTransaction);
router.post('/webhook', paystackWebhook);

module.exports = router;
