import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { createProcurement, getProcurements, quoteProcurement, approveProcurement, updateProcurementStatus } from '../controllers/procurement.controller';

import { uploadMiddleware } from '../controllers/upload.controller';

const router = Router();

router.use(authenticate);

// Main & Alias routes for submit procurement
router.post('/', uploadMiddleware.array('files', 10), createProcurement);
router.post('/request', uploadMiddleware.array('files', 10), createProcurement);

// Main & Alias routes for list procurements
router.get('/', getProcurements);
router.get('/requests', getProcurements);

// Main & Alias routes for quoting
router.post('/:id/quote', authorize('super_admin', 'admin', 'procurement'), permissionMiddleware('procurement', 'update'), quoteProcurement);
router.post('/requests/:id/quote', authorize('super_admin', 'admin', 'procurement'), permissionMiddleware('procurement', 'update'), quoteProcurement);

// Main & Alias routes for approving
router.post('/:id/approve', approveProcurement);
router.post('/requests/:id/approve', approveProcurement);

// Main & Alias routes for status update
router.patch('/:id/status', authorize('super_admin', 'admin', 'procurement'), permissionMiddleware('procurement', 'approve'), updateProcurementStatus);
router.patch('/requests/:id/status', authorize('super_admin', 'admin', 'procurement'), permissionMiddleware('procurement', 'approve'), updateProcurementStatus);

export default router;
