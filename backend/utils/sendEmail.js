const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_HOST?.includes('gmail') ? 'gmail' : undefined,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    debug: true, // Show debug logs
    logger: true // Enable internal logger
  });

  // Verify connection configuration
  try {
     await transporter.verify();
     console.log('✅ [EMAIL] Transporter verified and ready to send');
  } catch (err) {
     console.error('❌ [EMAIL] Transporter verification failed:', err.message);
  }

  const message = {
    from: `${process.env.SMTP_FROM_NAME || 'Transly'} <${process.env.SMTP_FROM_EMAIL || 'noreply@transly.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(message);
    console.log('✅ [EMAIL] Message sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ [EMAIL] Critical sending error:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
    });
    throw error;
  }
};

module.exports = sendEmail;
