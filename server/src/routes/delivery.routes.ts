import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { createDelivery, getDeliveries, assignDriver, updateDeliveryStatus } from '../controllers/delivery.controller';

const router = Router();

router.use(authenticate);

router.post('/', createDelivery);
router.get('/', getDeliveries);
router.post('/:id/driver', authorize('super_admin', 'admin', 'warehouse_ng'), permissionMiddleware('delivery', 'update'), assignDriver);
router.patch('/:id/status', authorize('super_admin', 'admin', 'warehouse_ng', 'driver'), permissionMiddleware('delivery', 'update_status'), updateDeliveryStatus);

export default router;
