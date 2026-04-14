const nodemailer = require('nodemailer');

let transporter;

const createTransporter = () => {
  if (transporter) return transporter;
  
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const isGmail = host.includes('gmail');

  console.log(`📡 [EMAIL] Initializing transporter: ${host}:${port} (Gmail Service: ${isGmail})`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ [EMAIL] Missing SMTP credentials! SMTP_USER or SMTP_PASS is empty.');
  }

  transporter = nodemailer.createTransport({
    service: isGmail ? 'gmail' : undefined,
    host: host,
    port: port,
    secure: port === 465, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
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
