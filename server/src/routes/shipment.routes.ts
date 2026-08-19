import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  createPreAlert,
  getPackages,
  consolidatePackages,
  createBatch,
  getConsolidations,
  getBatches,
  updatePackageStatus,
  trackPackage,
  scanPackageController,
  adminCreatePackage,
  addPackagesToBatch,
  updateConsolidation,
} from '../controllers/shipment.controller';

const router = Router();

// ── Public tracking (no auth) ─────────────────────────────────
router.get('/tracking/:trackingId', trackPackage);

// ── Authenticated routes ──────────────────────────────────────
router.use(authenticate);

router.post('/pre-alert', createPreAlert);
router.get('/packages', getPackages);
router.post('/consolidate', consolidatePackages);
router.get('/consolidations', getConsolidations);
router.put(
  '/consolidations/:id',
  authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'),
  updateConsolidation
);

// Admin/warehouse routes
router.post(
  '/packages/admin',
  authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'),
  adminCreatePackage
);
router.post(
  '/batches',
  authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'),
  createBatch
);
router.get('/batches', getBatches);
router.patch(
  '/batches/:id/packages',
  authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'),
  addPackagesToBatch
);
router.patch(
  '/packages/:id/status',
  authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'),
  updatePackageStatus
);
router.patch(
  '/packages/:id/scan',
  authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'),
  scanPackageController
);

export default router;
