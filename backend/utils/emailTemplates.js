const PRIMARY_COLOR = "#D35400"; // Dark Orange brand color

const buildBaseTemplate = (title, content, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { background-color: ${PRIMARY_COLOR}; padding: 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; }
    .content { padding: 40px 30px; color: #444444; line-height: 1.6; font-size: 16px; }
    .footer { background-color: #fcfcfc; padding: 20px 30px; text-align: center; font-size: 13px; color: #888888; border-top: 1px solid #eeeeee; }
    .social-icons { margin: 15px 0; }
    .social-icons a { display: inline-block; margin: 0 10px; }
    .social-icons img { width: 22px; height: 22px; opacity: 0.7; }
    .button { display: inline-block; padding: 14px 28px; background-color: ${PRIMARY_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; font-size: 16px; }
    .otp-box { background-color: #fdf2eb; border: 2px dashed ${PRIMARY_COLOR}; padding: 15px 30px; font-size: 36px; font-weight: bold; color: ${PRIMARY_COLOR}; text-align: center; letter-spacing: 8px; margin: 30px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1>TRANSLY</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <div class="social-icons">
        <a href="https://x.com/translynigeria?s=21" target="_blank"><img src="https://img.icons8.com/ios-filled/50/888888/twitterx--v2.png" alt="X" /></a>
        <a href="https://www.facebook.com/share/1AvyMHL6Fi/?mibextid=wwXIfr" target="_blank"><img src="https://img.icons8.com/ios-filled/24/888888/facebook-new.png" alt="Facebook" /></a>
        <a href="https://www.instagram.com/translynigeria?igsh=MWZzcHZxM2Zmc293dQ%3D%3D&utm_source=qr" target="_blank"><img src="https://img.icons8.com/ios-filled/24/888888/instagram-new.png" alt="Instagram" /></a>
        <a href="https://www.tiktok.com/@transly.nigeria?_r=1&_t=ZS-95Y6JDaI5sT" target="_blank"><img src="https://img.icons8.com/ios-filled/24/888888/tiktok.png" alt="TikTok" /></a>
      </div>
      <p>&copy; ${new Date().getFullYear()} Transly. All rights reserved.</p>
      <p>If you did not expect this email, please ignore it or contact support.</p>
    </div>
  </div>
</body>
</html>
`;

exports.buildOTPTemplate = (otp) => {
  const content = `
    <h2 style="color: #222; margin-top: 0; text-align: center;">Password Reset Request</h2>
    <p style="text-align: center;">We received a request to reset your password for your Transly account. Use the secure verification code below to proceed. This code will expire in exactly 10 minutes.</p>
    <div class="otp-box">${otp}</div>
    <p style="text-align: center; font-size: 14px; color: #666;">If you did not request a password reset, you can safely ignore this email.</p>
  `;
  return buildBaseTemplate("Your OTP Code", content, "Your Transly password reset OTP code is inside.");
};

exports.buildNotificationTemplate = (title, messageBody, cta = null) => {
  const formattedBody = messageBody.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
  let content = `
    <h2 style="color: #222; margin-top: 0;">${title}</h2>
    ${formattedBody}
  `;
  
  if (cta) {
    content += `<div style="text-align: center;"><a href="${cta.url}" class="button">${cta.text}</a></div>`;
  }
  
  return buildBaseTemplate(title, content, title);
};
