import { Wallet, WalletTransaction, User } from '../models';
import { sequelize } from '../config/database';

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

  public static async topUpWallet(userId: string, amount: number, paymentMethod: string) {
    return sequelize.transaction(async (t) => {
      let wallet = await Wallet.findOne({ where: { userId }, transaction: t });
      const user = await User.findByPk(userId, { transaction: t });
      if (!user) throw new Error('User not found');

      if (!wallet) {
        wallet = await Wallet.create(
          {
            userId,
            balance: 0,
            currency: 'NGN',
            escrowHeld: 0,
            availableBalance: 0,
          },
          { transaction: t }
        );
      }

      const newBalance = Number(wallet.balance) + Number(amount);
      const newAvailable = Number(wallet.availableBalance) + Number(amount);

      wallet.balance = newBalance;
      wallet.availableBalance = newAvailable;
      wallet.lastTopUpAt = new Date();
      await wallet.save({ transaction: t });

      await WalletTransaction.create(
        {
          customerId: user.customerId,
          type: 'credit',
          category: 'top_up',
          amount,
          currency: 'NGN',
          balanceAfter: newBalance,
          description: `Wallet top-up via ${paymentMethod}`,
        },
        { transaction: t }
      );

      return wallet;
    });
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
