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

  public static async getPermissionGroups() {
    return PermissionGroup.findAll({ include: [{ model: User, as: 'members', attributes: ['id'] }], order: [['name', 'ASC']] });
  }

  public static async createPermissionGroup(data: { name: string; description?: string; permissions: PermissionMatrix; isActive?: boolean }) {
    if (!data.name?.trim()) throw new Error('Permission group name is required');
    if (!data.permissions || typeof data.permissions !== 'object') throw new Error('A permission matrix is required');
    return PermissionGroup.create({ name: data.name.trim(), description: data.description?.trim(), permissions: data.permissions, isActive: data.isActive ?? true });
  }

  public static async updatePermissionGroup(id: string, data: Partial<{ name: string; description: string; permissions: PermissionMatrix; isActive: boolean }>) {
    const group = await PermissionGroup.findByPk(id);
    if (!group) throw new Error('Permission group not found');
    if (data.name !== undefined) group.name = data.name.trim();
    if (data.description !== undefined) group.description = data.description.trim();
    if (data.permissions !== undefined) group.permissions = data.permissions;
    if (data.isActive !== undefined) group.isActive = data.isActive;
    await group.save();
    return group;
  }

  public static async deletePermissionGroup(id: string) {
    const group = await PermissionGroup.findByPk(id);
    if (!group) throw new Error('Permission group not found');
    const members = await User.count({ where: { permissionGroupId: id } });
    if (members) throw new Error('Reassign staff before deleting this permission group');
    await group.destroy();
    return { deleted: true };
  }
}
