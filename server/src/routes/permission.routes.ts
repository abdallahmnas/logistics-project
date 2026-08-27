import { Router } from 'express';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getPermissionsByGroup,
  createPermissionForGroup,
  updatePermission,
  deletePermission,
} from '../controllers/permission.controller';

const router = Router();

// Require admin authentication for permission management
router.use(requireAuth, requireRole(['super_admin', 'admin']));

// Permission Group Endpoints
router.get('/permission-groups', getAllGroups);
router.post('/permission-groups', createGroup);
router.get('/permission-groups/:groupId', getGroupById);
router.patch('/permission-groups/:groupId', updateGroup);
router.delete('/permission-groups/:groupId', deleteGroup);

// Permissions within a Group Endpoints
router.get('/permission-groups/:groupId/permissions', getPermissionsByGroup);
router.post('/permission-groups/:groupId/permissions', createPermissionForGroup);

// Individual Permission Rule Endpoints
router.patch('/permissions/:permissionId', updatePermission);
router.delete('/permissions/:permissionId', deletePermission);

export default router;
