const nodemailer = require('nodemailer');
const dns = require('dns');

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ [EMAIL] Missing SMTP credentials! SMTP_USER or SMTP_PASS is empty.');
  } else {
    console.log('✅ [EMAIL] SMTP credentials present for:', process.env.SMTP_USER);
  }

  // Force IPv4 and Port 587 to bypass cloud provider blocks and IPv6 errors
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // CRITICAL: Force DNS to only return IPv4 addresses
    lookup: (hostname, options, callback) => {
      return dns.lookup(hostname, { family: 4 }, callback);
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 20000, 
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });
  
  return transporter;
};

const sendEmail = async (options) => {
  console.log(`📧 [EMAIL] Attempting to send email to: ${options.email} | Subject: ${options.subject}`);
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
