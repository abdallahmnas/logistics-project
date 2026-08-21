import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { User, SavedAccount } from '../models';

describe('Saved Receiving Accounts API', () => {
  let userToken: string;
  let userId: string;
  let createdAccountId: string;

  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'SavedAcc',
        lastName: 'Tester',
        email: `savedacc_${Date.now()}@example.com`,
        password: 'Password123!',
        phone: '+2348039998877',
      });

    userToken = userRes.body.data.token;
    userId = userRes.body.data.user.id;
  });

  it('should create a new saved receiving account with barcode', async () => {
    const res = await request(app)
      .post('/api/v1/exchanges/saved-accounts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        label: 'My Primary WeChat Pay',
        platform: 'wechat_pay',
        accountNumber: 'wxid_9988776655',
        accountName: 'Zhang Wei',
        barcodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        isDefault: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accountNumber).toBe('wxid_9988776655');
    expect(res.body.data.platform).toBe('wechat_pay');
    expect(res.body.data.isDefault).toBe(true);
    createdAccountId = res.body.data.id;
  });

  it('should fetch saved receiving accounts for customer', async () => {
    const res = await request(app)
      .get('/api/v1/exchanges/saved-accounts')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].accountNumber).toBe('wxid_9988776655');
  });

  it('should auto-save account when saveAccount flag is set during currency exchange', async () => {
    const exchangeRes = await request(app)
      .post('/api/v1/exchanges')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amountNaira: 250000,
        rmbDestType: 'alipay',
        rmbDestAccount: 'alipay_user_5544',
        rmbDestName: 'Chen Guo',
        receivingBarcodeUrl: 'data:image/png;base64,sample_alipay_barcode',
        nairaReceiptUrl: 'https://example.com/receipt.png',
        saveAccount: true,
      });

    expect(exchangeRes.status).toBe(201);
    expect(exchangeRes.body.success).toBe(true);

    const savedAccountsRes = await request(app)
      .get('/api/v1/exchanges/saved-accounts')
      .set('Authorization', `Bearer ${userToken}`);

    const alipayAccount = savedAccountsRes.body.data.find(
      (acc: any) => acc.accountNumber === 'alipay_user_5544'
    );
    expect(alipayAccount).toBeDefined();
    expect(alipayAccount.accountName).toBe('Chen Guo');
  });

  it('should delete a saved receiving account', async () => {
    const res = await request(app)
      .delete(`/api/v1/exchanges/saved-accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
