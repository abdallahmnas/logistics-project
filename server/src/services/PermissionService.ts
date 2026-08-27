import { Permission, PermissionGroup, User } from '../models';

export class PermissionService {
  /**
   * Get all active/inactive permissions for a specific group
   */
  public static async getByGroupId(groupId: string) {
    return Permission.findAll({
      where: { permissionGroupId: groupId },
      order: [['entity', 'ASC'], ['action', 'ASC']],
    });
  }

  /**
   * Get single permission rule by ID
   */
  public static async getById(id: string) {
    const perm = await Permission.findByPk(id, {
      include: [{ model: PermissionGroup, as: 'group' }],
    });
    if (!perm) throw new Error('Permission rule not found');
    return perm;
  }

  /**
   * Create a single permission rule
   */
  public static async create(data: {
    permissionGroupId: string;
    entity: string;
    action: string;
    status?: 'active' | 'inactive';
  }) {
    const group = await PermissionGroup.findByPk(data.permissionGroupId);
    if (!group) throw new Error('Permission Group not found');

    const existing = await Permission.findOne({
      where: {
        permissionGroupId: data.permissionGroupId,
        entity: data.entity.toLowerCase(),
        action: data.action.toLowerCase(),
      },
    });

    if (existing) {
      existing.status = data.status || 'active';
      await existing.save();
      return existing;
    }

    return Permission.create({
      permissionGroupId: data.permissionGroupId,
      entity: data.entity.toLowerCase(),
      action: data.action.toLowerCase(),
      status: data.status || 'active',
    });
  }

  /**
   * Update a permission rule
   */
  public static async update(id: string, data: {
    entity?: string;
    action?: string;
    status?: 'active' | 'inactive';
  }) {
    const perm = await Permission.findByPk(id);
    if (!perm) throw new Error('Permission rule not found');

    if (data.entity) perm.entity = data.entity.toLowerCase();
    if (data.action) perm.action = data.action.toLowerCase();
    if (data.status) perm.status = data.status;

    await perm.save();
    return perm;
  }

  /**
   * Delete a permission rule
   */
  public static async delete(id: string) {
    const perm = await Permission.findByPk(id);
    if (!perm) throw new Error('Permission rule not found');
    await perm.destroy();
    return { message: 'Permission rule deleted successfully' };
  }

  /**
   * Verify if a group has active permission for (entity, action)
   */
  public static async verifyUserPermission(permissionGroupId: string, entity: string, action: string): Promise<boolean> {
    if (!permissionGroupId) return false;

    // Check DB permissions table first
    const perm = await Permission.findOne({
      where: {
        permissionGroupId,
        entity: entity.toLowerCase(),
        action: action.toLowerCase(),
        status: 'active',
      },
    });

    if (perm) return true;

    // Fallback: check JSONB matrix on PermissionGroup for backwards compatibility
    const group = await PermissionGroup.findByPk(permissionGroupId);
    if (!group) return false;

    const matrix = group.permissions || {};
    const modulePerms = matrix[entity.toLowerCase()] || matrix[entity];
    if (modulePerms && modulePerms[action.toLowerCase()] === true) {
      return true;
    }

    return false;
  }

  /**
   * Get formatted permission matrix for a user/staff member
   */
  public static async getUserPermissionsList(permissionGroupId?: string) {
    if (!permissionGroupId) return [];

    const permRules = await Permission.findAll({
      where: { permissionGroupId, status: 'active' },
    });

    if (permRules.length > 0) {
      return permRules.map((p) => ({
        entity: p.entity,
        action: p.action,
      }));
    }

    // Fallback to JSONB matrix
    const group = await PermissionGroup.findByPk(permissionGroupId);
    if (!group || !group.permissions) return [];

    const list: Array<{ entity: string; action: string }> = [];
    Object.entries(group.permissions).forEach(([modKey, actions]) => {
      Object.entries(actions).forEach(([actionKey, isAllowed]) => {
        if (isAllowed) {
          list.push({ entity: modKey.toLowerCase(), action: actionKey.toLowerCase() });
        }
      });
    });

    return list;
  }

  /**
   * Sync permission matrix dictionary into discrete Permission database records
   */
  public static async syncMatrixToRules(groupId: string, matrix: Record<string, Record<string, boolean>>) {
    for (const [entity, actions] of Object.entries(matrix)) {
      for (const [action, allowed] of Object.entries(actions)) {
        await this.create({
          permissionGroupId: groupId,
          entity: entity.toLowerCase(),
          action: action.toLowerCase(),
          status: allowed ? 'active' : 'inactive',
        });
      }
    }
  }
}
