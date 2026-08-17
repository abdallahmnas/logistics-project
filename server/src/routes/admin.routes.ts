import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getDashboardStats, getAllUsers, createStaffMember, updateUser, deleteUser, getPermissionGroups, createPermissionGroup, updatePermissionGroup, deletePermissionGroup, getActivityLogs } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('super_admin', 'admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.post('/staff', authorize('super_admin'), createStaffMember);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', authorize('super_admin'), deleteUser);
router.get('/permission-groups', getPermissionGroups);
router.post('/permission-groups', authorize('super_admin'), createPermissionGroup);
router.patch('/permission-groups/:id', authorize('super_admin'), updatePermissionGroup);
router.delete('/permission-groups/:id', authorize('super_admin'), deletePermissionGroup);
router.get('/activity-logs', getActivityLogs);

export default router;
