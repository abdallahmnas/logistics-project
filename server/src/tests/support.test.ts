import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { sequelize, User } from '../models';
import { generateToken } from '../config/jwt';

describe('Support Ticket & Thread API', () => {
  let customerToken: string;
  let adminToken: string;
  let customerUser: User;
  let adminUser: User;
  let createdTicketId: string;

  beforeAll(async () => {
    await sequelize.sync();

    const timestamp = Date.now();
    customerUser = await User.create({
      customerId: `HZ-TKT-${timestamp}`,
      firstName: 'Support',
      lastName: 'Tester',
      email: `support_user_${timestamp}@example.com`,
      phone: '+2348011223344',
      role: 'customer',
      isVerified: true,
    });

    adminUser = await User.create({
      customerId: `HZ-ADM-${timestamp}`,
      firstName: 'Admin',
      lastName: 'Support',
      email: `admin_support_${timestamp}@example.com`,
      phone: '+2348099887766',
      role: 'admin',
      isVerified: true,
    });

    customerToken = generateToken({ id: customerUser.id, role: customerUser.role });
    adminToken = generateToken({ id: adminUser.id, role: adminUser.role });
  });

  it('should allow customer to create a support ticket with multipart file attachment', async () => {
    const res = await request(app)
      .post('/api/v1/support')
      .set('Authorization', `Bearer ${customerToken}`)
      .field('subject', 'Discrepancy in Package Weight')
      .field('category', 'shipment')
      .field('message', 'My package weight in China warehouse looks incorrect. Please verify.')
      .attach('attachments', Buffer.from('sample pdf image content'), 'damage_proof.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subject).toBe('Discrepancy in Package Weight');
    expect(res.body.data.messages).toBeDefined();
    expect(res.body.data.messages.length).toBeGreaterThan(0);
    expect(res.body.data.messages[0].attachments).toBeDefined();
    expect(res.body.data.messages[0].attachments.length).toBeGreaterThan(0);

    createdTicketId = res.body.data.id;
  });

  it('should allow staff to fetch and reply to support ticket with file attachment', async () => {
    const res = await request(app)
      .post(`/api/v1/support/${createdTicketId}/reply`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('message', 'Hello, we have re-weighed your package in Guangzhou warehouse. Attached is the scale snapshot.')
      .attach('attachments', Buffer.from('scale snapshot data'), 'weight_scale.jpg');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.messages.length).toBe(2);
    
    const replyMsg = res.body.data.messages[1];
    expect(replyMsg.senderRole).toBe('admin');
    expect(replyMsg.attachments).toBeDefined();
    expect(replyMsg.attachments.length).toBeGreaterThan(0);
  });

  it('should allow staff to update ticket status to resolved', async () => {
    const res = await request(app)
      .patch(`/api/v1/support/${createdTicketId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('resolved');
  });
});
