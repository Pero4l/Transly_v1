const express = require('express');
const { createShipment, getMyShipments, updateShipmentStatus } = require('../controllers/shipment.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createShipment);
router.get('/', protect, getMyShipments);
router.put('/:id/status', protect, updateShipmentStatus);

module.exports = router;
