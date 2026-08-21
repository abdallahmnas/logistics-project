import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { requireAuth, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public / Authenticated read access
router.get('/', getSettings);

// Admin update access
router.put('/', requireAuth, authorize('super_admin', 'admin', 'finance'), updateSettings);

export default router;
