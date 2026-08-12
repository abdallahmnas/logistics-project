import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { sequelize, User, Wallet } from '../models';
import { generateToken } from '../config/jwt';

describe('Wallet & Financial Engine API', () => {
  let customerToken: string;
  let customerUser: User;

  beforeAll(async () => {
    await sequelize.sync();

    // Use test-scoped email that won't conflict with seed data
    await Wallet.destroy({ where: {} }).catch(() => {});
    await User.destroy({ where: { email: 'test-wallet-customer@test.local' } });

    customerUser = await User.create({
      customerId: `HZ-TEST-WALLET-${Date.now()}`,
      firstName: 'Fatima',
      lastName: 'Bello',
      email: 'test-wallet-customer@test.local',
      phone: '+2348022220001',
      role: 'customer',
      isVerified: true,
    });

    await Wallet.create({
      userId: customerUser.id,
      balance: 100000,
      currency: 'NGN',
      escrowHeld: 0,
      availableBalance: 100000,
    });

    customerToken = generateToken({ id: customerUser.id, role: customerUser.role });
  });

  afterAll(async () => {
    await Wallet.destroy({ where: { userId: customerUser?.id } }).catch(() => {});
    await User.destroy({ where: { email: 'test-wallet-customer@test.local' } });
  });

  it('should fetch user wallet details', async () => {
    const res = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.balance)).toBe(100000);
  });

  it('should top up wallet balance', async () => {
    const res = await request(app)
      .post('/api/v1/wallet/top-up')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        amount: 50000,
        paymentMethod: 'bank_transfer',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Number(res.body.data.balance)).toBe(150000);
  });

  it('should list wallet transactions history', async () => {
    const res = await request(app)
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
