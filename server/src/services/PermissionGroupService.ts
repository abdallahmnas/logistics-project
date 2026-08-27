import { sequelize, PermissionGroup, Permission, User } from '../models';
import { PermissionService } from './PermissionService';

export class PermissionGroupService {
  /**
   * Get all permission groups with their permission rules and member counts
   */
  public static async getAll() {
    const groups = await PermissionGroup.findAll({
      include: [
        { model: Permission, as: 'permissionRules' },
        { model: User, as: 'members', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return groups;
  }

  /**
   * Get group by ID
   */
  public static async getById(id: string) {
    const group = await PermissionGroup.findByPk(id, {
      include: [
        { model: Permission, as: 'permissionRules' },
        { model: User, as: 'members', attributes: ['id', 'firstName', 'lastName', 'email', 'role'] },
      ],
    });

    if (!group) throw new Error('Permission Group not found');
    return group;
  }

  /**
   * Create a new permission group
   */
  public static async create(data: {
    title?: string;
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
    permissions?: Record<string, Record<string, boolean>>;
  }) {
    const groupName = data.title || data.name;
    if (!groupName) throw new Error('Permission Group title/name is required');

    const group = await PermissionGroup.create({
      name: groupName,
      title: groupName,
      description: data.description,
      status: data.status || 'active',
      isActive: data.status !== 'inactive',
      permissions: data.permissions || {},
    });

    if (data.permissions && Object.keys(data.permissions).length > 0) {
      await PermissionService.syncMatrixToRules(group.id, data.permissions);
    }

    return this.getById(group.id);
  }

  /**
   * Update permission group
   */
  public static async update(id: string, data: {
    title?: string;
    name?: string;
    description?: string;
    status?: 'active' | 'inactive';
    permissions?: Record<string, Record<string, boolean>>;
  }) {
    const group = await PermissionGroup.findByPk(id);
    if (!group) throw new Error('Permission Group not found');

    const groupName = data.title || data.name;
    if (groupName) {
      group.name = groupName;
      group.title = groupName;
    }
    if (data.description !== undefined) group.description = data.description;
    if (data.status) {
      group.status = data.status;
      group.isActive = data.status === 'active';
    }
    if (data.permissions) {
      group.permissions = data.permissions;
      await PermissionService.syncMatrixToRules(group.id, data.permissions);
    }

    await group.save();
    return this.getById(group.id);
  }

  /**
   * Delete group and associated permissions in a transaction
   */
  public static async delete(id: string) {
    const t = await sequelize.transaction();
    try {
      const group = await PermissionGroup.findByPk(id, { transaction: t });
      if (!group) throw new Error('Permission Group not found');

      // Unassign users attached to this group
      await User.update({ permissionGroupId: undefined }, { where: { permissionGroupId: id }, transaction: t });

      // Delete associated permissions
      await Permission.destroy({ where: { permissionGroupId: id }, transaction: t });

      // Delete group
      await group.destroy({ transaction: t });

      await t.commit();
      return { message: 'Permission Group and associated rules deleted successfully' };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
