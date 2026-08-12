import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('GET /api/v1/health', () => {
  it('should return 200 OK with success status and timestamp', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toContain('Logicore RMB Logistics API operational');
    expect(response.body).toHaveProperty('timestamp');
  });
});
