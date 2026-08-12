import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { sequelize } from '../config/database';
import { User, Wallet } from '../models';

describe('Auth & RBAC API', () => {
  let customerToken = '';
  let customerId = '';

  beforeAll(async () => {
    // Clear tests tables
    await User.destroy({ where: { email: 'testcustomer@example.com' } });
  });

  afterAll(async () => {
    // Clean up
    if (customerId) {
      await Wallet.destroy({ where: { userId: customerId } });
      await User.destroy({ where: { id: customerId } });
    }
  });

  it('should register a new user and create a default wallet', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Test',
      lastName: 'Customer',
      email: 'testcustomer@example.com',
      phone: '+2348000000000',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('testcustomer@example.com');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data).toHaveProperty('token');

    customerId = res.body.data.user.id;
    customerToken = res.body.data.token;

    // Verify wallet was created
    const wallet = await Wallet.findOne({ where: { userId: customerId } });
    expect(wallet).not.toBeNull();
    expect(wallet?.currency).toBe('NGN');
  });

  it('should prevent registration with an existing email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      firstName: 'Test',
      lastName: 'Duplicate',
      email: 'testcustomer@example.com',
      phone: '+2348000000000',
      password: 'password123',
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('already registered');
  });

  it('should login an existing user', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'testcustomer@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.user.email).toBe('testcustomer@example.com');
    expect(res.body.data).toHaveProperty('token');
  });

  it('should fetch the current user profile (me)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.email).toBe('testcustomer@example.com');
    expect(res.body.data).toHaveProperty('wallet');
  });

  it('should block unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  it('should block unauthorized role access (RBAC)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden');
  });
});
