import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { sequelize, User, Package } from '../models';
import { generateToken } from '../config/jwt';

describe('Shipment & Logistics API', () => {
  let customerToken: string;
  let adminToken: string;
  let customerUser: User;
  let adminUser: User;

  beforeAll(async () => {
    await sequelize.sync();

    // Use test-scoped emails that won't conflict with seed data
    await User.destroy({ where: { email: 'test-shipment-customer@test.local' } });
    await User.destroy({ where: { email: 'test-shipment-admin@test.local' } });

    customerUser = await User.create({
      customerId: `HZ-TEST-SHIP-${Date.now()}`,
      firstName: 'Adebayo',
      lastName: 'Okonkwo',
      email: 'test-shipment-customer@test.local',
      phone: '+2348012340001',
      role: 'customer',
      isVerified: true,
    });

    adminUser = await User.create({
      customerId: `HZ-TEST-ADMIN-${Date.now()}`,
      firstName: 'Admin',
      lastName: 'Test',
      email: 'test-shipment-admin@test.local',
      phone: '+2348099990001',
      role: 'super_admin',
      isVerified: true,
    });

    customerToken = generateToken({ id: customerUser.id, role: customerUser.role });
    adminToken = generateToken({ id: adminUser.id, role: adminUser.role });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: 'test-shipment-customer@test.local' } });
    await User.destroy({ where: { email: 'test-shipment-admin@test.local' } });
  });

  it('should allow customer to create a pre-alert package', async () => {
    const res = await request(app)
      .post('/api/v1/shipments/pre-alert')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        chineseTrackingNo: 'SF1234567890',
        supplierName: 'Shenzhen Tech',
        description: 'iPhone Cases (50 pcs)',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.chineseTrackingNo).toBe('SF1234567890');
    expect(res.body.data.status).toBe('pre_alerted');
  });

  it('should list all packages for the logged in customer', async () => {
    const res = await request(app)
      .get('/api/v1/shipments/packages')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should allow customer to request package consolidation', async () => {
    const pkg1 = await Package.create({
      trackingId: `HZ-AIR-2024-${Date.now()}-001`,
      chineseTrackingNo: 'CN111',
      customerId: customerUser.customerId,
      customerName: `${customerUser.firstName} ${customerUser.lastName}`,
      status: 'received_cn',
      description: 'Shoes',
      weightKg: 4.0,
      cbm: 0.02,
      preAlertDate: new Date(),
    });

    const pkg2 = await Package.create({
      trackingId: `HZ-AIR-2024-${Date.now()}-002`,
      chineseTrackingNo: 'CN222',
      customerId: customerUser.customerId,
      customerName: `${customerUser.firstName} ${customerUser.lastName}`,
      status: 'received_cn',
      description: 'Bags',
      weightKg: 3.5,
      cbm: 0.015,
      preAlertDate: new Date(),
    });

    const res = await request(app)
      .post('/api/v1/shipments/consolidate')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        packageIds: [pkg1.id, pkg2.id],
        shippingMethod: 'air',
        destinationWarehouse: 'lagos',
        paymentMethod: 'wallet',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.packageIds).toHaveLength(2);
    expect(res.body.data.totalWeightKg).toBe(7.5);
  });

  it('should allow admin to create a master batch', async () => {
    const res = await request(app)
      .post('/api/v1/shipments/batches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        carrierName: 'Ethiopian Airlines Cargo',
        flightVoyageNo: 'ET-9928',
        shippingType: 'air',
        packageIds: [],
        consolidationIds: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.masterTrackingId).toBeDefined();
  });
});
