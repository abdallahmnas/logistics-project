import { ProcurementRequest, User, Wallet } from '../models';
import { ActivityLogService } from './ActivityLogService';
import { NotificationService } from './NotificationService';

import { SettingsService } from './SettingsService';

export class ProcurementService {
  public static async createRequest(userId: string, payload: {
    productUrl: string;
    productPhotos?: string[];
    quantity: number;
    specifications: string;
    sizes?: string;
    colors?: string;
    variations?: string;
    notes?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    // Fetch system settings & check wallet balance for Buy-For-Me submission fee
    const settings = await SettingsService.getSettings();
    const submissionFee = settings?.buyForMeFixedFee || 1000;

    if (submissionFee > 0) {
      let wallet = await Wallet.findOne({ where: { userId: user.id } });
      const currentBalance = wallet ? wallet.balance : 0;
      if (currentBalance < submissionFee) {
        throw new Error(
          `Insufficient wallet balance. Buy-For-Me submission fee is ₦${submissionFee.toLocaleString()}, but your available balance is ₦${currentBalance.toLocaleString()}. Please top up your wallet.`
        );
      }
      if (wallet) {
        wallet.balance = wallet.balance - submissionFee;
        wallet.availableBalance = wallet.balance - (wallet.escrowHeld || 0);
        await wallet.save();
      }
    }

    const req = await ProcurementRequest.create({
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      productUrl: payload.productUrl,
      productPhotos: payload.productPhotos || [],
      quantity: payload.quantity || 1,
      specifications: payload.specifications,
      sizes: payload.sizes,
      colors: payload.colors,
      variations: payload.variations,
      notes: payload.notes,
      status: 'submitted',
      submittedAt: new Date(),
    });

    ActivityLogService.logActivity({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      module: 'procurement',
      action: 'SUBMIT_PROCUREMENT',
      description: `Customer submitted Buy-For-Me request for ${payload.quantity} items`,
      entityId: req.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: user.id,
      orderType: 'Procurement',
      orderId: req.id,
      newStatus: 'submitted',
      statusDescription: `Buy-For-Me procurement request submitted for ${payload.quantity} items. Our team is verifying stock with Chinese suppliers.`,
    });

    return req;
  }

  public static async getRequests(customerId?: string) {
    if (customerId) return ProcurementRequest.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return ProcurementRequest.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async quoteRequest(id: string, payload: {
    productCostRmb: number;
    serviceFeeRmb: number;
    supplierName: string;
    exchangeRateUsed?: number;
  }) {
    const proc = await ProcurementRequest.findByPk(id);
    if (!proc) throw new Error('Procurement request not found');

    const settings = await SettingsService.getSettings();
    const totalCostRmb = Number(payload.productCostRmb) + Number(payload.serviceFeeRmb);
    const rate = payload.exchangeRateUsed || settings.cnyExchangeRate || 215;
    const totalCostNaira = Math.round(totalCostRmb * rate);

    proc.productCostRmb = payload.productCostRmb;
    proc.serviceFeeRmb = payload.serviceFeeRmb;
    proc.totalCostRmb = totalCostRmb;
    proc.exchangeRateUsed = rate;
    proc.totalCostNaira = totalCostNaira;
    proc.supplierName = payload.supplierName;
    proc.status = 'quoted';
    proc.quotedAt = new Date();
    await proc.save();

    ActivityLogService.logActivity({
      userId: proc.customerId,
      userName: proc.customerName,
      userRole: 'procurement',
      module: 'procurement',
      action: 'QUOTE_REQUEST',
      description: `Issued quote for procurement request ${proc.id} (¥${totalCostRmb} / ₦${totalCostNaira.toLocaleString()})`,
      entityId: proc.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: proc.customerId,
      orderType: 'Procurement',
      orderId: proc.id,
      newStatus: 'quoted',
      statusDescription: `Supplier quote ready: ¥${totalCostRmb} (₦${totalCostNaira.toLocaleString()}). Please log in to approve and pay.`,
    });

    return proc;
  }

  public static async approveRequest(id: string, customerId: string) {
    const proc = await ProcurementRequest.findByPk(id);
    if (!proc) throw new Error('Procurement request not found');
    if (proc.customerId !== customerId) throw new Error('You cannot approve another customer\'s request');
    if (proc.status !== 'quoted') throw new Error('Only quoted requests can be approved');

    // Deduct totalCostNaira from customer's platform wallet
    const wallet = await Wallet.findOne({ where: { userId: user.id } });
    const currentBalance = wallet ? wallet.balance : 0;
    const totalCost = proc.totalCostNaira || 0;

    if (currentBalance < totalCost) {
      throw new Error(`Insufficient wallet balance. Total quote fee is ₦${totalCost.toLocaleString()}, but your balance is ₦${currentBalance.toLocaleString()}. Please top up your wallet.`);
    }

    if (wallet) {
      wallet.balance = wallet.balance - totalCost;
      wallet.availableBalance = wallet.balance - (wallet.escrowHeld || 0);
      await wallet.save();
    }

    proc.status = 'approved';
    proc.approvedAt = new Date();
    await proc.save();

    ActivityLogService.logActivity({
      userId: proc.customerId,
      userName: proc.customerName,
      userRole: 'customer',
      module: 'procurement',
      action: 'APPROVE_QUOTE',
      description: `Customer approved procurement quote ${proc.id}`,
      entityId: proc.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: proc.customerId,
      orderType: 'Procurement',
      orderId: proc.id,
      newStatus: 'approved',
      statusDescription: `Payment confirmed. ₦${proc.totalCostNaira.toLocaleString()} deducted from wallet. Order queued for purchasing.`,
    });

    return proc;
  }

  public static async updateStatus(id: string, status: string) {
    const proc = await ProcurementRequest.findByPk(id);
    if (!proc) throw new Error('Procurement request not found');

    const allowed = ['submitted', 'quoted', 'approved', 'purchased', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}`);

    (proc as any).status = status;
    await proc.save();

    ActivityLogService.logActivity({
      userId: proc.customerId,
      userName: proc.customerName,
      userRole: 'admin',
      module: 'procurement',
      action: 'UPDATE_PROCUREMENT_STATUS',
      description: `Updated procurement request ${proc.id} status to ${status}`,
      entityId: proc.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: proc.customerId,
      orderType: 'Procurement',
      orderId: proc.id,
      newStatus: status,
      statusDescription: `Procurement order status updated to ${status}.`,
    });

    return proc;
  }
}
