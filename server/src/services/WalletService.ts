import { Wallet, WalletTransaction, WalletDeposit, User } from '../models';
import { sequelize } from '../config/database';
import { NotificationService } from './NotificationService';
import { ActivityLogService } from './ActivityLogService';

export class WalletService {
  public static async getWalletByUserId(userId: string) {
    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');
      wallet = await Wallet.create({
        userId,
        balance: 0,
        currency: 'NGN',
        escrowHeld: 0,
        availableBalance: 0,
      });
    }
    return wallet;
  }

  public static async submitDepositRequest(
    userId: string,
    payload: {
      amount: number;
      senderName: string;
      sessionId?: string;
      paymentReceiptUrl: string;
    }
  ) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User account not found');
    if (!payload.amount || payload.amount <= 0) throw new Error('Invalid deposit amount');
    if (!payload.senderName || !payload.senderName.trim()) throw new Error('Sender name is required');
    if (!payload.paymentReceiptUrl) throw new Error('Payment receipt upload is required');

    const customerName = `${user.firstName} ${user.lastName}`;

    const deposit = await WalletDeposit.create({
      userId: user.id,
      customerId: user.customerId,
      customerName,
      amount: payload.amount,
      currency: 'NGN',
      senderName: payload.senderName.trim(),
      paymentReceiptUrl: payload.paymentReceiptUrl,
      sessionId: payload.sessionId ? payload.sessionId.trim() : undefined,
      status: 'pending',
    });

    ActivityLogService.logActivity({
      userId: user.id,
      userName: customerName,
      userRole: user.role,
      module: 'wallet',
      action: 'SUBMIT_DEPOSIT_REQUEST',
      description: `Customer submitted manual wallet deposit request ₦${payload.amount.toLocaleString()}`,
      entityId: deposit.id,
    });

    NotificationService.notifyAdmins({
      title: 'New Wallet Deposit Request',
      message: `Customer ${customerName} (${user.customerId}) submitted a wallet deposit request for ₦${payload.amount.toLocaleString()}. Please verify receipt and approve.`,
      type: 'wallet_deposit',
      referenceId: deposit.id,
    });

    return deposit;
  }

  public static async getCustomerDeposits(userId: string) {
    return WalletDeposit.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  public static async getAllDepositsAdmin(statusFilter?: string) {
    const whereClause: any = {};
    if (statusFilter && statusFilter !== 'all') {
      whereClause.status = statusFilter;
    }
    return WalletDeposit.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
  }

  public static async approveDepositAdmin(depositId: string, adminUser: { id: string; name: string }) {
    return sequelize.transaction(async (t) => {
      const deposit = await WalletDeposit.findByPk(depositId, { transaction: t });
      if (!deposit) throw new Error('Wallet deposit request not found');
      if (deposit.status !== 'pending') throw new Error(`Deposit request is already ${deposit.status}`);

      const user = await User.findByPk(deposit.userId, { transaction: t });
      if (!user) throw new Error('Customer user account not found');

      let wallet = await Wallet.findOne({ where: { userId: deposit.userId }, transaction: t });
      if (!wallet) {
        wallet = await Wallet.create(
          {
            userId: deposit.userId,
            balance: 0,
            currency: 'NGN',
            escrowHeld: 0,
            availableBalance: 0,
          },
          { transaction: t }
        );
      }

      const newBalance = Number(wallet.balance) + Number(deposit.amount);
      const newAvailable = Number(wallet.availableBalance) + Number(deposit.amount);

      wallet.balance = newBalance;
      wallet.availableBalance = newAvailable;
      wallet.lastTopUpAt = new Date();
      await wallet.save({ transaction: t });

      await WalletTransaction.create(
        {
          customerId: user.customerId,
          type: 'credit',
          category: 'top_up',
          amount: deposit.amount,
          currency: 'NGN',
          balanceAfter: newBalance,
          description: `Bank deposit approved (Sender: ${deposit.senderName}${deposit.sessionId ? `, Ref: ${deposit.sessionId}` : ''})`,
          referenceId: deposit.id,
        },
        { transaction: t }
      );

      deposit.status = 'approved';
      deposit.reviewedBy = adminUser.name;
      deposit.reviewedAt = new Date();
      await deposit.save({ transaction: t });

      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: 'admin',
        module: 'wallet',
        action: 'APPROVE_DEPOSIT',
        description: `Approved wallet deposit request ${deposit.id} (₦${deposit.amount.toLocaleString()}) for customer ${deposit.customerName}`,
        entityId: deposit.id,
      });

      NotificationService.sendOrderStatusNotification({
        userIdOrCustomerId: user.customerId,
        orderType: 'Wallet Funding',
        orderId: deposit.id.slice(0, 8),
        newStatus: 'approved',
        statusDescription: `Your bank deposit of ₦${deposit.amount.toLocaleString()} has been approved and credited to your wallet balance. New Balance: ₦${newBalance.toLocaleString()}.`,
      });

      return { deposit, wallet };
    });
  }

  public static async rejectDepositAdmin(
    depositId: string,
    adminUser: { id: string; name: string },
    rejectionReason: string
  ) {
    const deposit = await WalletDeposit.findByPk(depositId);
    if (!deposit) throw new Error('Wallet deposit request not found');
    if (deposit.status !== 'pending') throw new Error(`Deposit request is already ${deposit.status}`);

    const reason = rejectionReason ? rejectionReason.trim() : 'Payment receipt verification failed';

    deposit.status = 'rejected';
    deposit.rejectionReason = reason;
    deposit.reviewedBy = adminUser.name;
    deposit.reviewedAt = new Date();
    await deposit.save();

    ActivityLogService.logActivity({
      userId: adminUser.id,
      userName: adminUser.name,
      userRole: 'admin',
      module: 'wallet',
      action: 'REJECT_DEPOSIT',
      description: `Rejected wallet deposit request ${deposit.id} (₦${deposit.amount.toLocaleString()}) for customer ${deposit.customerName}. Reason: ${reason}`,
      entityId: deposit.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: deposit.customerId,
      orderType: 'Wallet Funding',
      orderId: deposit.id.slice(0, 8),
      newStatus: 'rejected',
      statusDescription: `Your wallet deposit request of ₦${deposit.amount.toLocaleString()} was rejected. Reason: ${reason}`,
    });

    return deposit;
  }

  public static async getTransactions(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    return WalletTransaction.findAll({
      where: { customerId: user.customerId },
      order: [['createdAt', 'DESC']],
    });
  }
}
