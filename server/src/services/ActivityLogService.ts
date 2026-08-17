import { ActivityLog } from '../models';
import { Op } from 'sequelize';

export class ActivityLogService {
  public static async logActivity(payload: {
    userId: string;
    userName: string;
    userRole: string;
    module: 'auth' | 'shipments' | 'warehouse' | 'procurement' | 'exchange' | 'wallet' | 'staff' | 'settings';
    action: string;
    description: string;
    entityId?: string;
    metadata?: object;
    ipAddress?: string;
  }) {
    try {
      return await ActivityLog.create(payload);
    } catch (err: any) {
      console.error('[ActivityLog] Failed to record activity log:', err.message);
      return null;
    }
  }

  public static async getActivityLogs(query: {
    module?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const limit = query.limit || 50;
    const offset = query.offset || 0;
    const where: any = {};

    if (query.module && query.module !== 'all') {
      where.module = query.module;
    }

    if (query.search) {
      const lower = query.search.toLowerCase();
      where[Op.or] = [
        { userName: { [Op.iLike]: `%${lower}%` } },
        { description: { [Op.iLike]: `%${lower}%` } },
        { action: { [Op.iLike]: `%${lower}%` } },
        { entityId: { [Op.iLike]: `%${lower}%` } },
      ];
    }

    const { count, rows } = await ActivityLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return { total: count, logs: rows };
  }
}
