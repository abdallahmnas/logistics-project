import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { createProcurement, getProcurements, quoteProcurement, approveProcurement, updateProcurementStatus } from '../controllers/procurement.controller';

const router = Router();

router.use(authenticate);

router.post('/', createProcurement);
router.get('/', getProcurements);
router.post('/:id/quote', authorize('super_admin', 'admin', 'procurement'), permissionMiddleware('procurement', 'update'), quoteProcurement);
router.post('/:id/approve', approveProcurement);
router.patch('/:id/status', authorize('super_admin', 'admin', 'procurement'), permissionMiddleware('procurement', 'approve'), updateProcurementStatus);

export default router;
