import { User, Package, Batch, ExchangeRequest, ProcurementRequest, LocalDelivery, WalletTransaction } from '../models';
import { Op } from 'sequelize';

export class AdminService {
  public static async getDashboardStats() {
    const totalUsers = await User.count({ where: { role: 'customer' } });
    const totalPackages = await Package.count();
    const pendingPackages = await Package.count({ where: { status: 'pre_alerted' } });
    const activeBatches = await Batch.count();
    const pendingProcurements = await ProcurementRequest.count({ where: { status: 'submitted' } });
    const pendingExchanges = await ExchangeRequest.count({ where: { status: 'pending' } });
    const activeDeliveries = await LocalDelivery.count({ where: { status: 'in_transit' } });

    // Revenue from wallet top-ups and completed exchanges
    const allTxs = await WalletTransaction.findAll({ where: { type: 'credit' } });
    const totalRevenue = allTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyTxs = await WalletTransaction.findAll({
      where: { type: 'credit', createdAt: { [Op.gte]: startOfMonth } },
    });
    const monthlyRevenue = monthlyTxs.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      totalUsers,
      totalPackages,
      pendingPackages,
      activeBatches,
      pendingProcurements,
      pendingExchanges,
      activeDeliveries,
      totalRevenue,
      monthlyRevenue,
    };
  }

  public static async getAllUsers() {
    return User.findAll({
      attributes: { exclude: ['passwordHash', 'otpCode', 'otpExpiry', 'resetToken', 'resetTokenExpiry'] },
      order: [['createdAt', 'DESC']],
    });
  }

  public static async updateUser(userId: string, data: {
    role?: string;
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (data.role) (user as any).role = data.role;
    if (data.isActive !== undefined) (user as any).isActive = data.isActive;
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.phone) user.phone = data.phone;

    await user.save();
    const { passwordHash, otpCode, ...safeUser } = user.toJSON() as any;
    return safeUser;
  }

  public static async deleteUser(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    if (user.role === 'super_admin') throw new Error('Cannot delete super admin');
    await user.destroy();
    return { deleted: true };
  }
}
