import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { sequelize, User, ProcurementRequest } from '../models';
import { generateToken } from '../config/jwt';

describe('Buy-For-Me Procurement API', () => {
  let customerToken: string;
  let adminToken: string;
  let customerUser: User;
  let adminUser: User;

  beforeAll(async () => {
    await sequelize.sync();

    await User.destroy({ where: { email: 'chidi@example.com' } });
    await User.destroy({ where: { email: 'adminstaff@hamzarmb.com' } });

    customerUser = await User.create({
      customerId: 'HZ-20241003',
      firstName: 'Chidi',
      lastName: 'Eze',
      email: 'chidi@example.com',
      phone: '+2348033334444',
      role: 'customer',
      isVerified: true,
    });

    adminUser = await User.create({
      customerId: 'HZ-ADMIN-002',
      firstName: 'Admin',
      lastName: 'Staff',
      email: 'adminstaff@hamzarmb.com',
      phone: '+2348098888888',
      role: 'super_admin',
      isVerified: true,
    });

    customerToken = generateToken({ id: customerUser.id, role: customerUser.role });
    adminToken = generateToken({ id: adminUser.id, role: adminUser.role });
  });

  it('should submit a new procurement request', async () => {
    const res = await request(app)
      .post('/api/v1/procurements')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        productUrl: 'https://detail.1688.com/offer/123456.html',
        quantity: 100,
        specifications: 'Black matte size L',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('submitted');
    expect(res.body.data.productUrl).toBe('https://detail.1688.com/offer/123456.html');
  });

  it('should allow admin to quote a procurement request', async () => {
    const proc = await ProcurementRequest.create({
      customerId: customerUser.customerId,
      customerName: `${customerUser.firstName} ${customerUser.lastName}`,
      productUrl: 'https://detail.1688.com/offer/999.html',
      quantity: 50,
      specifications: 'White 500ml',
      submittedAt: new Date(),
    });

    const res = await request(app)
      .post(`/api/v1/procurements/${proc.id}/quote`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productCostRmb: 1000,
        serviceFeeRmb: 100,
        supplierName: 'Shenzhen Supplier',
        exchangeRateUsed: 215,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('quoted');
    expect(res.body.data.totalCostRmb).toBe(1100);
  });
});
