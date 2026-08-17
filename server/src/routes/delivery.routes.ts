import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createDelivery, getDeliveries, assignDriver, updateDeliveryStatus } from '../controllers/delivery.controller';

const router = Router();

router.use(authenticate);

router.post('/', createDelivery);
router.get('/', getDeliveries);
router.post('/:id/driver', authorize('super_admin', 'admin', 'warehouse_ng'), assignDriver);
router.patch('/:id/status', authorize('super_admin', 'admin', 'warehouse_ng'), updateDeliveryStatus);

export default router;
