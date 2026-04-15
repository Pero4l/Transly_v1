const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const axios = require('axios');

const sendEmail = async (options) => {
  console.log(`📧 [EMAIL] Attempting to send (HTTP API) to: ${options.email}`);
  
  // 1. Setup OAuth2 Client (Using environment variables you will set)
  const oauth2Client = new OAuth2Client(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  try {
    // 2. Get a fresh access token from Google
    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    if (!accessToken) {
      throw new Error("Failed to get Google Access Token. Check your GMAIL_REFRESH_TOKEN.");
    }

    // 3. Compile the raw email using nodemailer's stream transport (it won't send via network)
    const transporter = nodemailer.createTransport({ streamTransport: true });
    
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Transly'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@transly.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Convert the email stream into a base64url encoded string
    let chunks = [];
    for await (let chunk of info.message) {
      chunks.push(chunk);
    }
    const rawEmail = Buffer.concat(chunks)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // 4. Send using Gmail HTTP REST API (Bypasses Render's port blocks!)
    const response = await axios.post(
      'https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=media',
      rawEmail,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'message/rfc822'
        }
      }
    );

    console.log("✅ [EMAIL] Message sent via HTTP API: %s", response.data.id);
    return response.data;
  } catch (error) {
    console.error("❌ [EMAIL] Critical error (HTTP):", error.response?.data || error.message);
    throw error;
  }
};

module.exports = sendEmail;
