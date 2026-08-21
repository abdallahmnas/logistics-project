import { ExchangeRate, ExchangeRequest, User, SavedAccount } from '../models';
import { uploadToCloudinary, uploadBase64ToCloudinary } from '../config/cloudinary';
import { ActivityLogService } from './ActivityLogService';
import { NotificationService } from './NotificationService';

export class ExchangeService {
  public static async getSavedAccounts(userId: string) {
    return SavedAccount.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  public static async createSavedAccount(userId: string, payload: {
    label?: string;
    platform: 'wechat_pay' | 'alipay' | 'chinese_bank';
    accountNumber: string;
    accountName: string;
    barcodeUrl?: string;
    isDefault?: boolean;
  }) {
    if (payload.isDefault) {
      await SavedAccount.update({ isDefault: false }, { where: { userId } });
    }

    const existingCount = await SavedAccount.count({ where: { userId } });
    const isFirst = existingCount === 0;

    const account = await SavedAccount.create({
      userId,
      label: payload.label || `${payload.platform === 'wechat_pay' ? 'WeChat' : payload.platform === 'alipay' ? 'Alipay' : 'Chinese Bank'} (${payload.accountName})`,
      platform: payload.platform,
      accountNumber: payload.accountNumber,
      accountName: payload.accountName,
      barcodeUrl: payload.barcodeUrl,
      isDefault: payload.isDefault !== undefined ? payload.isDefault : isFirst,
    });

    return account;
  }

  public static async deleteSavedAccount(userId: string, accountId: string) {
    const deleted = await SavedAccount.destroy({
      where: { id: accountId, userId },
    });
    if (!deleted) throw new Error('Saved account not found');
    return { success: true };
  }

  public static async setDefaultAccount(userId: string, accountId: string) {
    await SavedAccount.update({ isDefault: false }, { where: { userId } });
    const [updated] = await SavedAccount.update(
      { isDefault: true },
      { where: { id: accountId, userId } }
    );
    if (!updated) throw new Error('Saved account not found');
    return SavedAccount.findByPk(accountId);
  }

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
    saveAccount?: boolean;
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

    if (!payload.rmbDestAccount || !payload.rmbDestName) {
      throw new Error('Please save and select a receiving wallet account (WeChat / Alipay ID & Barcode) first');
    }

    if (!payload.nairaReceiptUrl && !(payload as any).nairaReceipt) {
      throw new Error('Bank transfer screenshot proof of payment is required to submit an exchange request');
    }

    const rawReceipt = payload.nairaReceiptUrl || (payload as any).nairaReceipt;
    let uploadedReceiptUrl = rawReceipt;
    if (rawReceipt && rawReceipt.startsWith('data:image')) {
      uploadedReceiptUrl = await uploadBase64ToCloudinary(rawReceipt, 'logicore/exchange-receipts');
    }

    const rawBarcode = payload.rmbDestQrCode || payload.receivingBarcodeUrl;
    let uploadedBarcodeUrl = rawBarcode;
    if (rawBarcode && rawBarcode.startsWith('data:image')) {
      uploadedBarcodeUrl = await uploadBase64ToCloudinary(rawBarcode, 'logicore/barcodes');
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
      status: uploadedReceiptUrl ? 'receipt_uploaded' : 'pending',
      escrowBankName: 'GTBank',
      escrowAccountNo: '0123456789',
      escrowAccountName: 'Hamza RMB Trading Ltd',
      nairaReceiptUrl: uploadedReceiptUrl,
      rmbDestType: payload.rmbDestType,
      rmbDestAccount: payload.rmbDestAccount,
      rmbDestName: payload.rmbDestName,
      rmbDestQrCode: uploadedBarcodeUrl,
      receivingBarcodeUrl: uploadedBarcodeUrl,
      requestedAt: new Date(),
      expiresAt,
    });

    if (payload.saveAccount) {
      try {
        await this.createSavedAccount(userId, {
          platform: payload.rmbDestType,
          accountNumber: payload.rmbDestAccount,
          accountName: payload.rmbDestName,
          barcodeUrl: payload.rmbDestQrCode || payload.receivingBarcodeUrl,
        });
      } catch (e) {
        console.error('Failed to auto-save account:', e);
      }
    }

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
    if (!['pending', 'receipt_uploaded', 'awaiting_payment'].includes(exchange.status)) {
      throw new Error(`Cannot verify — current status is ${exchange.status}`);
    }

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

  public static async rejectExchange(exchangeId: string, adminId: string, reason?: string) {
    const exchange = await ExchangeRequest.findByPk(exchangeId);
    if (!exchange) throw new Error('Exchange request not found');
    if (['completed', 'cancelled'].includes(exchange.status)) {
      throw new Error(`Cannot reject — exchange request is already ${exchange.status}`);
    }

    const rejectionReason = reason || 'Payment proof verification failed or invalid receiving wallet details.';
    (exchange as any).status = 'cancelled';
    (exchange as any).rejectionReason = rejectionReason;
    await exchange.save();

    ActivityLogService.logActivity({
      userId: adminId,
      userName: 'Finance Staff',
      userRole: 'finance',
      module: 'exchange',
      action: 'REJECT_EXCHANGE',
      description: `Rejected exchange request ${exchange.id}. Reason: ${rejectionReason}`,
      entityId: exchange.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: exchange.customerId,
      orderType: 'Exchange',
      orderId: exchange.id,
      newStatus: 'cancelled',
      statusDescription: `Your currency exchange request was declined by finance staff. Reason: ${rejectionReason}`,
    });

    return exchange;
  }
}
