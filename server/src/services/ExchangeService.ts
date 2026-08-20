import { ExchangeRate, ExchangeRequest, User } from '../models';
import { uploadToCloudinary } from '../config/cloudinary';
import { ActivityLogService } from './ActivityLogService';
import { NotificationService } from './NotificationService';

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
    direction?: 'ngn_to_rmb' | 'rmb_to_ngn';
    amountNaira?: number;
    amountRmb?: number;
    rmbDestType: 'alipay' | 'wechat_pay' | 'chinese_bank';
    rmbDestAccount: string;
    rmbDestName: string;
    rmbDestQrCode?: string;
    receivingBarcodeUrl?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const activeRate = await this.getActiveRate();
    const platformRate = activeRate.platformRate;
    const direction = payload.direction || 'ngn_to_rmb';

    let amountNaira = payload.amountNaira || 0;
    let amountRmb = payload.amountRmb || 0;

    if (direction === 'ngn_to_rmb') {
      if (!amountNaira || amountNaira <= 0) {
        throw new Error('Please enter a valid Naira amount to exchange');
      }
      amountRmb = Number((amountNaira / platformRate).toFixed(2));
    } else {
      if (!amountRmb || amountRmb <= 0) {
        throw new Error('Please enter a valid RMB/Yen amount to exchange');
      }
      amountNaira = Number((amountRmb * platformRate).toFixed(2));
    }

    const platformFee = 5000;
    const totalNaira = amountNaira + platformFee;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const exchange = await ExchangeRequest.create({
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      direction,
      amountNaira,
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
      rmbDestQrCode: payload.rmbDestQrCode || payload.receivingBarcodeUrl,
      receivingBarcodeUrl: payload.receivingBarcodeUrl || payload.rmbDestQrCode,
      requestedAt: new Date(),
      expiresAt,
    });

    ActivityLogService.logActivity({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      module: 'exchange',
      action: 'CREATE_EXCHANGE',
      description: `Created RMB exchange request for ₦${payload.amountNaira.toLocaleString()} (¥${amountRmb})`,
      entityId: exchange.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: user.id,
      orderType: 'Exchange',
      orderId: exchange.id,
      newStatus: 'pending',
      statusDescription: `Exchange request initiated for ₦${payload.amountNaira.toLocaleString()} (¥${amountRmb}). Please deposit funds into the GTBank Escrow Account.`,
    });

    return exchange;
  }

  public static async getExchanges(customerId?: string) {
    if (customerId) return ExchangeRequest.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return ExchangeRequest.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async updateRate(payload: { buyRate: number; sellRate: number; platformRate: number }) {
    await ExchangeRate.update({ isActive: false }, { where: { isActive: true } });
    const newRate = await ExchangeRate.create({
      buyRate: payload.buyRate,
      sellRate: payload.sellRate,
      platformRate: payload.platformRate,
      effectiveFrom: new Date(),
      isActive: true,
    });

    ActivityLogService.logActivity({
      userId: 'system',
      userName: 'Finance Admin',
      userRole: 'finance',
      module: 'exchange',
      action: 'UPDATE_EXCHANGE_RATE',
      description: `Updated active RMB exchange rate to ₦${payload.platformRate}/¥`,
      entityId: newRate.id,
    });

    return newRate;
  }

  public static async verifyNairaPayment(exchangeId: string, adminId: string) {
    const exchange = await ExchangeRequest.findByPk(exchangeId);
    if (!exchange) throw new Error('Exchange request not found');
    if (exchange.status !== 'pending') throw new Error(`Cannot verify — current status is ${exchange.status}`);

    (exchange as any).status = 'naira_confirmed';
    (exchange as any).nairaConfirmedAt = new Date();
    await exchange.save();

    ActivityLogService.logActivity({
      userId: adminId,
      userName: 'Finance Manager',
      userRole: 'finance',
      module: 'exchange',
      action: 'VERIFY_NAIRA_PAYMENT',
      description: `Verified Naira escrow deposit for exchange request ${exchange.id}`,
      entityId: exchange.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: exchange.customerId,
      orderType: 'Exchange',
      orderId: exchange.id,
      newStatus: 'naira_confirmed',
      statusDescription: 'Naira escrow deposit verified by finance manager. RMB transfer processing to supplier account.',
    });

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

    ActivityLogService.logActivity({
      userId: adminId,
      userName: 'Finance Manager',
      userRole: 'finance',
      module: 'exchange',
      action: 'RELEASE_RMB',
      description: `Released RMB payment (¥${exchange.amountRmb}) to ${exchange.rmbDestName} (${exchange.rmbDestType})`,
      entityId: exchange.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: exchange.customerId,
      orderType: 'Exchange',
      orderId: exchange.id,
      newStatus: 'completed',
      statusDescription: `RMB payment of ¥${exchange.amountRmb} released to ${exchange.rmbDestName} (${exchange.rmbDestType}). Exchange complete.`,
    });

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
