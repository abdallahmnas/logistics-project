import { User, Package, Batch, ExchangeRequest, ProcurementRequest, LocalDelivery, WalletTransaction, PermissionGroup } from '../models';
import type { PermissionMatrix } from '../models/PermissionGroup';
import { Op } from 'sequelize';
import { ActivityLogService } from './ActivityLogService';

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

  public static async createStaffMember(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    permissionGroupId?: string;
    password?: string;
  }) {
    const bcrypt = await import('bcryptjs');
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) throw new Error('A user with this email already exists');

    const hashedPassword = await bcrypt.default.hash(data.password || 'Logistics123!', 10);
    const count = (await User.count()) + 1;
    const customerId = `STF-${String(count).padStart(4, '0')}`;

    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role as any,
      permissionGroupId: data.permissionGroupId || undefined,
      passwordHash: hashedPassword,
      isVerified: true,
      customerId,
    });

    // Log Activity Trail
    ActivityLogService.logActivity({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: 'super_admin',
      module: 'staff',
      action: 'CREATE_STAFF',
      description: `Onboarded new staff member ${user.firstName} ${user.lastName} with role ${user.role}`,
      entityId: user.id,
    });

    const { passwordHash, otpCode, ...safeUser } = user.toJSON() as any;
    return safeUser;
  }

  public static async updateUser(userId: string, data: {
    role?: string;
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    phone?: string;
    permissionGroupId?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (data.role) (user as any).role = data.role;
    if (data.isActive !== undefined) (user as any).isActive = data.isActive;
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.phone) user.phone = data.phone;
    if (data.permissionGroupId !== undefined) user.permissionGroupId = data.permissionGroupId || undefined;

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

  public static async getPermissionGroups() {
    const { PermissionGroupService } = await import('./PermissionGroupService');
    return PermissionGroupService.getAll();
  }

  public static async createPermissionGroup(data: { name?: string; title?: string; description?: string; permissions?: PermissionMatrix; isActive?: boolean; status?: 'active' | 'inactive' }) {
    const { PermissionGroupService } = await import('./PermissionGroupService');
    return PermissionGroupService.create({
      name: data.name || data.title || '',
      title: data.title || data.name || '',
      description: data.description,
      status: data.status || (data.isActive === false ? 'inactive' : 'active'),
      permissions: data.permissions,
    });
  }

  public static async updatePermissionGroup(id: string, data: Partial<{ name: string; title: string; description: string; permissions: PermissionMatrix; isActive: boolean; status: 'active' | 'inactive' }>) {
    const { PermissionGroupService } = await import('./PermissionGroupService');
    return PermissionGroupService.update(id, {
      name: data.name || data.title,
      title: data.title || data.name,
      description: data.description,
      status: data.status || (data.isActive === false ? 'inactive' : 'active'),
      permissions: data.permissions,
    });
  }

  public static async deletePermissionGroup(id: string) {
    const { PermissionGroupService } = await import('./PermissionGroupService');
    return PermissionGroupService.delete(id);
  }
}
