require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function testEmail() {
    console.log('🚀 Starting email test...');
    console.log(`Config: Host=${process.env.SMTP_HOST}, Port=${process.env.SMTP_PORT}, User=${process.env.SMTP_USER}`);
    
    try {
        await sendEmail({
            email: process.env.SMTP_USER,
            subject: 'Transly Test Email',
            message: 'If you receive this, your email configuration is working!',
            html: '<h1>Success!</h1><p>Your Transly email service is correctly configured.</p>'
        });
        console.log('✅ Test email SENT successfully!');
    } catch (err) {
        console.error('❌ Test email FAILED');
        // error is already logged detailedly in sendEmail.js
    }
}

testEmail();
