const { Shipment, User, Notification } = require('../models');
const { initializePayment, verifyPayment } = require('../utils/paystack');
const sendEmail = require('../utils/sendEmail');
const { buildNotificationTemplate } = require('../utils/emailTemplates');
const crypto = require('crypto');

exports.initializeTransaction = async (req, res) => {
  const { shipmentId } = req.body;

  if (!shipmentId) {
    return res.status(400).json({ success: false, error: 'Shipment ID is required' });
  }

  try {
    const shipment = await Shipment.findByPk(shipmentId, {
      include: [{ model: User, as: 'customer' }]
    });

    if (!shipment) return res.status(404).json({ success: false, error: 'Shipment not found' });
    
    // Authorization check
    if (shipment.customerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized for this shipment payment' });
    }

    if (shipment.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, error: 'Shipment is already paid' });
    }

    // Generate a unique reference
    const reference = `PAY_${shipment.id.substring(0, 8)}_${Date.now()}`;
    
    shipment.paymentReference = reference;
    await shipment.save();

    const paystackRes = await initializePayment(shipment.customer.email, shipment.price, reference);

    res.status(200).json({ 
      success: true, 
      authorization_url: paystackRes.data.authorization_url,
      access_code: paystackRes.data.access_code,
      reference
    });
  } catch (error) {
    console.error('Payment Init Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Payment initialization failed' });
  }
};

exports.verifyTransaction = async (req, res) => {
  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ success: false, error: 'Payment reference is required' });
  }

  try {
    const response = await verifyPayment(reference);

    if (response.data && response.data.status === 'success') {
      const shipment = await Shipment.findOne({ where: { paymentReference: reference } });
      if (!shipment) {
         return res.status(404).json({ success: false, error: 'Corresponding shipment not found for this transaction' });
      }

      if (shipment.paymentStatus === 'paid') {
         return res.status(200).json({ success: true, message: 'Payment was already verified and processed.' });
      }

      shipment.paymentStatus = 'paid';
      await shipment.save();

      await Notification.create({
        userId: shipment.customerId,
        message: `Your payment of ₦${shipment.price} for shipment ${shipment.trackingNumber} was successful.`,
        type: 'success'
      });

      await sendEmail({
        email: shipment.customer.email,
        subject: `Payment Successful - Tracker: ${shipment.trackingNumber}`,
        html: buildNotificationTemplate('Payment Successful', `Dear ${shipment.customer.name},\n\nWe are delighted to inform you that your payment of ₦${shipment.price} for shipment ${shipment.trackingNumber} was successfully processed.\n\nYour shipment will now be assigned to a driver for pickup. You can track its progress live on your dashboard.\n\nThank you for choosing Transly!`)
      }).catch(err => console.error('Payment Email Error (Customer):', err.message));

      await sendEmail({
        email: "translynigeria@gmail.com",
        subject: `New Payment Received - Tracker: ${shipment.trackingNumber}`,
        html: buildNotificationTemplate('New Payment Received', `Hello Admin,\n\nA new payment of ₦${shipment.price} has successfully been securely processed for shipment ${shipment.trackingNumber} belonging to ${shipment.customer.name}.\n\nThe funds have been cleared and the shipment is fully authenticated and ready for dispatch assignment.\n\nBest regards,\nTransly System Automation`)
      }).catch(err => console.error('Payment Email Error (Admin):', err.message));

      res.status(200).json({ success: true, message: 'Payment verified and shipment updated' });
    } else {
      res.status(400).json({ success: false, error: 'Payment failed at Paystack gateway' });
    }
  } catch (error) {
    console.error('Payment Verify Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Payment verification failed' });
  }
};

exports.paystackWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;
      
      // When Paystack successfully charges a customer
      if (event.event === 'charge.success') {
        const reference = event.data.reference;
        const shipment = await Shipment.findOne({ where: { paymentReference: reference }, include: [{ model: User, as: 'customer' }] });

        if (shipment && shipment.paymentStatus !== 'paid') {
            shipment.paymentStatus = 'paid';
            await shipment.save();

            // Emit Notifications
            await Notification.create({
              userId: shipment.customerId,
              message: `Your payment of ₦${shipment.price} via Webhook for shipment ${shipment.trackingNumber} was successful.`,
              type: 'success'
            });

            await sendEmail({
              email: shipment.customer.email,
              subject: `Payment Successful - Tracker: ${shipment.trackingNumber}`,
              html: buildNotificationTemplate('Payment Successful', `Dear ${shipment.customer.name},\n\nWe are delighted to inform you that your payment of ₦${shipment.price} for shipment ${shipment.trackingNumber} was successfully processed.\n\nYour shipment will now be assigned to a driver for pickup. You can track its progress live on your dashboard.\n\nThank you for choosing Transly!`)
            }).catch(err => console.error('Payment Email Error (Customer Webhook):', err.message));

            await sendEmail({
              email: "translynigeria@gmail.com",
              subject: `New Payment Received - Tracker: ${shipment.trackingNumber}`,
              html: buildNotificationTemplate('New Payment Received', `Hello Admin,\n\nA new payment of ₦${shipment.price} has successfully been securely processed for shipment ${shipment.trackingNumber} belonging to ${shipment.customer.name}.\n\nThe funds have been cleared and the shipment is fully authenticated and ready for dispatch assignment.\n\nBest regards,\nTransly System Automation`)
            }).catch(err => console.error('Payment Email Error (Admin Webhook):', err.message));
        }
      }
    }
    // Paystack requires a 200 OK immediately so it won't retry endlessly
    res.status(200).send('Webhook Processed');
  } catch (error) {
    console.error('Webhook Error:', error);
    // Still send 200 so Paystack drops the event from retry loop
    res.status(200).send('Webhook Received (with internal errors)');
  }
};
