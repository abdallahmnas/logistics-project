import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { sequelize, User, ExchangeRate } from '../models';
import { generateToken } from '../config/jwt';

describe('Currency Exchange API', () => {
  let customerToken: string;
  let customerUser: User;

  beforeAll(async () => {
    await sequelize.sync();

    await User.destroy({ where: { email: 'kemi@example.com' } });

    customerUser = await User.create({
      customerId: 'HZ-20241004',
      firstName: 'Kemi',
      lastName: 'Ade',
      email: 'kemi@example.com',
      phone: '+2348044445555',
      role: 'customer',
      isVerified: true,
    });

    await ExchangeRate.create({
      buyRate: 213,
      sellRate: 217,
      platformRate: 215,
      effectiveFrom: new Date(),
      isActive: true,
    });

    customerToken = generateToken({ id: customerUser.id, role: customerUser.role });
  });

  it('should fetch the active exchange rate', async () => {
    const res = await request(app).get('/api/v1/exchanges/rate');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.platformRate).toBe(215);
  });

  it('should submit a currency exchange request', async () => {
    const res = await request(app)
      .post('/api/v1/exchanges')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        amountNaira: 500000,
        rmbDestType: 'alipay',
        rmbDestAccount: '13800001111',
        rmbDestName: 'Kemi Ade',
        nairaReceiptUrl: 'https://example.com/sample_receipt.png',
      });

    if (res.status !== 201) console.log('DEBUG EXCHANGE RES BODY:', res.body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amountNaira).toBe(500000);
    expect(res.body.data.escrowBankName).toBeDefined();
  });
});
