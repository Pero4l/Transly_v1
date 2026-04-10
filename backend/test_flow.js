const axios = require('axios');

(async () => {
  try {
    // 1. Create Admin
    const adminRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Admin User', email: 'admin@transly.com', password: 'password', role: 'admin'
    });
    const adminToken = adminRes.data.token;
    console.log('Admin created.');

    // 2. Create Driver
    const driverRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Driver Joe', email: 'driver@transly.com', password: 'password', role: 'driver'
    });
    const driverToken = driverRes.data.token;
    const driverId = driverRes.data.user.id;
    console.log('Driver created.');

    // 3. Create Customer
    const custRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Cust Sam', email: 'cust@transly.com', password: 'password', role: 'customer'
    });
    const custToken = custRes.data.token;
    console.log('Customer created.');

    // 4. Create Shipment
    const shipRes = await axios.post('http://localhost:5000/api/shipments', {
      origin: 'New York', destination: 'Boston', distance: 200
    }, { headers: { Authorization: `Bearer ${custToken}` } });
    const shipmentId = shipRes.data.shipment.id;
    console.log('Shipment created:', shipRes.data.shipment.trackingNumber);

    // 5. Admin Assign Driver
    await axios.post('http://localhost:5000/api/admin/assign-driver', {
      shipmentId, driverId
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('Driver assigned.');

    // 6. Driver Pick Up
    await axios.put(`http://localhost:5000/api/shipments/${shipmentId}/status`, {
      status: 'picked_up'
    }, { headers: { Authorization: `Bearer ${driverToken}` } });
    console.log('Shipment picked up.');

    console.log('All tests passed successfully!');
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
})();
