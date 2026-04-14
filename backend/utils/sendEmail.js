const nodemailer = require('nodemailer');

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ [EMAIL] Missing SMTP credentials! SMTP_USER or SMTP_PASS is empty.');
  } else {
    console.log('✅ [EMAIL] SMTP credentials present for:', process.env.SMTP_USER);
  }

  // Simplified Gmail config - service: 'gmail' is often more reliable than host/port manually
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000, 
  });
  
  return transporter;
};

const sendEmail = async (options) => {
  const mailTransporter = createTransporter();

  const message = {
    from: `${process.env.SMTP_FROM_NAME || 'Transly'} <${process.env.SMTP_FROM_EMAIL || 'noreply@transly.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await mailTransporter.sendMail(message);
    console.log('✅ [EMAIL] Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ [EMAIL] Critical sending error:', {
        message: error.message,
        code: error.code
    });
    throw error;
  }
};

module.exports = sendEmail;
