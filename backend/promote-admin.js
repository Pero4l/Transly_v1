const { User } = require('./models');
const db = require('./config/db');

async function makeAdmin(email) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      process.exit(1);
    }
    user.role = 'admin';
    await user.save();
    console.log(`✅ Success: ${email} is now an ADMIN.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node promote-admin.js user@example.com');
    process.exit(1);
}
makeAdmin(email);
