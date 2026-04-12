const express = require('express');
const { createShipment, getMyShipments, updateShipmentStatus, getShipmentById, trackShipment } = require('../controllers/shipment.controller');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/track/:trackingNumber', trackShipment);

router.post('/', protect, createShipment);
router.get('/', protect, getMyShipments);
router.get('/:id', protect, getShipmentById);
router.put('/:id/status', protect, updateShipmentStatus);

module.exports = router;
