const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(`📧 [EMAIL] Attempting to send to: ${options.email}`);
  
  // Matching idu-group-backend logic 1:1
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true, // Enable debug logs in Render console
    logger: true // Enable internal logger
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
