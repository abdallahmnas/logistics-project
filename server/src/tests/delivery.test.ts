import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { sequelize, User, Wallet } from '../models';
import { generateToken } from '../config/jwt';

describe('Local Delivery API', () => {
  let customerToken: string;
  let customerUser: User;

  beforeAll(async () => {
    await sequelize.sync();

    await User.destroy({ where: { email: 'tunde@example.com' } });

    customerUser = await User.create({
      customerId: 'HZ-20241005',
      firstName: 'Tunde',
      lastName: 'Bakare',
      email: 'tunde@example.com',
      phone: '+2348055556666',
      role: 'customer',
      isVerified: true,
    });

    await Wallet.destroy({ where: { userId: customerUser.id } });
    await Wallet.create({
      userId: customerUser.id,
      balance: 50000,
      availableBalance: 50000,
      escrowHeld: 0,
      currency: 'NGN',
    });

    customerToken = generateToken({ id: customerUser.id, role: customerUser.role });
  });

  it('should request a local delivery', async () => {
    const res = await request(app)
      .post('/api/v1/delivery')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        pickupAddress: '15 Balogun Street, Lagos Island',
        pickupCity: 'Lagos',
        pickupPhone: '+2348012345678',
        pickupContactName: 'Warehouse Staff',
        dropoffAddress: '42 Admiralty Way, Lekki Phase 1',
        dropoffCity: 'Lagos',
        dropoffPhone: '+2348055556666',
        dropoffContactName: 'Tunde Bakare',
        packageDescription: 'Smartwatch straps',
        vehicleType: 'sedan',
        paymentMethod: 'wallet',
      });

    if (res.status !== 201) console.log('DEBUG DELIVERY RES BODY:', res.body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.pickupAddress).toContain('Balogun');
    expect(res.body.data.status).toBe('pending');
  });
});
