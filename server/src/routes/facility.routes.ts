import { Router } from 'express';
import {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../controllers/facility.controller';
import { requireAuth, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public / Authenticated read routes
router.get('/', getFacilities);
router.get('/:id', getFacilityById);

// Admin-only mutation routes
router.post('/', requireAuth, authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'), createFacility);
router.put('/:id', requireAuth, authorize('super_admin', 'admin', 'warehouse_cn', 'warehouse_ng'), updateFacility);
router.delete('/:id', requireAuth, authorize('super_admin', 'admin'), deleteFacility);

export default router;
