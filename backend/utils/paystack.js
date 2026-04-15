const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Avoid interceptor crashes if PAYSTACK_SECRET_KEY isn't set dynamically yet
paystack.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${process.env.PAYSTACK_SECRET_KEY}`;
  return config;
});

exports.initializePayment = async (email, amount, reference) => {
  try {
    const response = await paystack.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // convert to kobo (smallest currency unit)
      reference
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

exports.verifyPayment = async (reference) => {
  try {
    const response = await paystack.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
