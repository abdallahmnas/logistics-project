import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getDashboardStats, getAllUsers, updateUser, deleteUser } from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, authorize('super_admin', 'admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', authorize('super_admin'), deleteUser);

export default router;
