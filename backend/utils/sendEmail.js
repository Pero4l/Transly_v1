const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`📧 [EMAIL] Attempting to send to: ${options.email}`);
  
  // Matching idu-group-backend logic but forcing Port 587 (often more open than 465)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // FORCE IPv4 to avoid the ENETUNREACH IPv6 issue
    family: 4,
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  });

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Transly'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@transly.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL] Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ [EMAIL] Critical error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
