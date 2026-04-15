const express = require('express');
const router = express.Router();
const { initializeTransaction, verifyTransaction } = require('../controllers/payment.controller');
const { protect } = require('../middlewares/authMiddleware');

router.post('/initialize', protect, initializeTransaction);
router.post('/verify', protect, verifyTransaction);

module.exports = router;
