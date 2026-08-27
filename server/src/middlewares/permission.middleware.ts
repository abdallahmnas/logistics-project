import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/PermissionService';

/**
 * permissionMiddleware(entity, action)
 * Guards routes according to staff permission rules.
 */
export const permissionMiddleware = (entity: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;

      // 1. If no user, return 401 Unauthorized
      if (!user) {
        res.status(401).json({ success: false, message: 'Unauthorized: Authentication required' });
        return;
      }

      // 2. If user is super_admin or admin, allow access immediately
      if (['super_admin', 'admin'].includes(user.role)) {
        return next();
      }

      // 3. If user is customer, return 403 Forbidden
      if (user.role === 'customer') {
        res.status(403).json({ success: false, message: 'Forbidden: Customers cannot access staff resources' });
        return;
      }

      // 4. Extract permissionGroupId from user
      const permissionGroupId = user.permissionGroupId;
      if (!permissionGroupId) {
        res.status(403).json({ success: false, message: 'Forbidden: No permission group assigned to staff account' });
        return;
      }

      // 5. Verify active permission rule exists
      const isAllowed = await PermissionService.verifyUserPermission(permissionGroupId, entity, action);

      if (!isAllowed) {
        res.status(403).json({
          success: false,
          message: `Forbidden: Insufficient permissions to ${action} ${entity}`,
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

export const requirePermission = permissionMiddleware;
