const express = require('express');
const { getAllUsers, getAllCustomers, getAllDrivers, getAllShipments, assignDriver, updateSettings, createDriver, toggleSuspend, createAdmin } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/authMiddleware');
const { authorizeAdmin } = require('../middlewares/adminMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorizeAdmin);

router.get('/users', getAllUsers);
router.get('/customers', getAllCustomers); 
router.get('/drivers', getAllDrivers);
router.get('/shipments', getAllShipments);
router.post('/assign-driver', assignDriver);
router.post('/settings', updateSettings);
router.post('/driver', createDriver);
router.put('/users/:id/suspend', toggleSuspend);
router.post('/admin', createAdmin);


module.exports = router;
