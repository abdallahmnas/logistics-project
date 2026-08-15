import { ExchangeRate, ExchangeRequest, User } from '../models';
import { uploadToCloudinary } from '../config/cloudinary';

export class ExchangeService {
  public static async getActiveRate() {
    let rate = await ExchangeRate.findOne({ where: { isActive: true }, order: [['createdAt', 'DESC']] });
    if (!rate) {
      rate = await ExchangeRate.create({
        buyRate: 213,
        sellRate: 217,
        platformRate: 215,
        effectiveFrom: new Date(),
        isActive: true,
      });
    }
    return rate;
  }

  public static async createExchange(userId: string, payload: {
    amountNaira: number;
    rmbDestType: 'alipay' | 'wechat_pay' | 'chinese_bank';
    rmbDestAccount: string;
    rmbDestName: string;
    rmbDestQrCode?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const activeRate = await this.getActiveRate();
    const platformRate = activeRate.platformRate;
    const amountRmb = Number((payload.amountNaira / platformRate).toFixed(2));
    const platformFee = 5000;
    const totalNaira = payload.amountNaira + platformFee;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const exchange = await ExchangeRequest.create({
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      amountNaira: payload.amountNaira,
      amountRmb,
      exchangeRate: platformRate,
      platformFee,
      totalNaira,
      status: 'pending',
      escrowBankName: 'GTBank',
      escrowAccountNo: '0123456789',
      escrowAccountName: 'Hamza RMB Trading Ltd',
      rmbDestType: payload.rmbDestType,
      rmbDestAccount: payload.rmbDestAccount,
      rmbDestName: payload.rmbDestName,
      rmbDestQrCode: payload.rmbDestQrCode,
      requestedAt: new Date(),
      expiresAt,
    });
    return exchange;
  }

  public static async getExchanges(customerId?: string) {
    if (customerId) return ExchangeRequest.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return ExchangeRequest.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async updateRate(payload: { buyRate: number; sellRate: number; platformRate: number }) {
    await ExchangeRate.update({ isActive: false }, { where: { isActive: true } });
    return ExchangeRate.create({
      buyRate: payload.buyRate,
      sellRate: payload.sellRate,
      platformRate: payload.platformRate,
      effectiveFrom: new Date(),
      isActive: true,
    });
  }

  public static async verifyNairaPayment(exchangeId: string, adminId: string) {
    const exchange = await ExchangeRequest.findByPk(exchangeId);
    if (!exchange) throw new Error('Exchange request not found');
    if (exchange.status !== 'pending') throw new Error(`Cannot verify — current status is ${exchange.status}`);

    (exchange as any).status = 'naira_confirmed';
    (exchange as any).nairaConfirmedAt = new Date();
    await exchange.save();
    return exchange;
  }

  public static async releaseRmb(exchangeId: string, adminId: string) {
    const exchange = await ExchangeRequest.findByPk(exchangeId);
    if (!exchange) throw new Error('Exchange request not found');
    if (exchange.status !== 'naira_confirmed') throw new Error(`Cannot release — current status is ${exchange.status}`);

    const now = new Date();
    (exchange as any).status = 'completed';
    (exchange as any).rmbReleasedAt = now;
    (exchange as any).completedAt = now;
    await exchange.save();
    return exchange;
  }

  public static async uploadReceipt(exchangeId: string, customerId: string, photoBuffer: Buffer) {
    const exchange = await ExchangeRequest.findByPk(exchangeId);
    if (!exchange) throw new Error('Exchange request not found');
    if (exchange.customerId !== customerId) throw new Error('You cannot upload a receipt for another customer');
    if (!['pending', 'awaiting_payment'].includes(exchange.status)) {
      throw new Error(`Cannot upload a receipt while the request is ${exchange.status}`);
    }

    const receiptUrl = await uploadToCloudinary(photoBuffer, 'logicore/exchange-receipts', exchangeId);
    exchange.nairaReceiptUrl = receiptUrl;
    exchange.status = 'receipt_uploaded';
    await exchange.save();
    return exchange;
  }
}
