import { sequelize, User, Wallet } from './server/src/models/index.js';
import bcrypt from 'bcryptjs';

async function test() {
  const transaction = await sequelize.transaction();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const user = await User.create({
      customerId: 'HZ-TEST-TX',
      firstName: 'Test',
      lastName: 'User',
      email: 'test-tx@test.com',
      phone: '12345',
      passwordHash: hashedPassword,
      role: 'customer'
    }, { transaction });

    await Wallet.create({
      userId: user.id,
      balance: 0,
      currency: 'NGN',
      availableBalance: 0
    }, { transaction });

    await transaction.commit();
    console.log("Success");
  } catch (err) {
    await transaction.rollback();
    console.error("Error:", err);
  } finally {
    process.exit();
  }
}
test();
