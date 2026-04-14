const nodemailer = require('nodemailer');
const dns = require('dns');

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;
  
  // Sticking to Port 587 as it's the cloud standard for STARTTLS
  const host = 'smtp.gmail.com';
  const port = 587;
  const isSecure = false;

  console.log(`📡 [EMAIL] Initializing transporter: ${host}:${port}`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ [EMAIL] Missing SMTP credentials! SMTP_USER or SMTP_PASS is empty.');
  }

  transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // CRITICAL: Hard-force IPv4 using resolve4 to bypass Render's IPv6 issues
    lookup: (hostname, options, callback) => {
      dns.resolve4(hostname, (err, addresses) => {
        if (err || !addresses || addresses.length === 0) {
          console.warn(`⚠️ [DNS] resolve4 failed for ${hostname}, falling back to lookup:`, err?.message);
          return dns.lookup(hostname, { family: 4 }, callback);
        }
        const addr = addresses[0];
        console.log(`🔍 [DNS] Resolved ${hostname} to ${addr} (IPv4 resolve4)`);
        callback(null, addr, 4);
      });
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000, 
    greetingTimeout: 30000,
    socketTimeout: 30000,
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
