const { User } = require('./models');
const db = require('./config/db');

async function checkAdmins() {
  try {
    const admins = await User.findAll({ where: { role: 'admin' } });
    console.log('Total Admins found:', admins.length);
    admins.forEach(a => console.log(`- ${a.name} (${a.email})`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAdmins();

