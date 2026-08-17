import { sequelize, User, Wallet } from './server/src/models/index.js';
import bcrypt from 'bcryptjs';

async function test() {
  try {
    await sequelize.sync({ force: true });
    console.log("DB Synced");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const user = await User.create({
      customerId: 'HZ-TEST',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@test.com',
      phone: '12345',
      passwordHash: hashedPassword,
      role: 'customer'
    });
    console.log("User created:", user.toJSON());
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit();
  }
}
test();
