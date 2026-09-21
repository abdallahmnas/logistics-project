import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../controllers/upload.controller';
import {
  getActiveBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/banner.controller';

const router = Router();

// Public Mobile Endpoint (No Auth Required)
router.get('/', getActiveBanners);

// Admin Routes (Authenticated)
router.get('/admin', authenticate, authorize('super_admin', 'admin', 'staff', 'finance'), getAllBannersAdmin);
router.post('/', authenticate, authorize('super_admin', 'admin', 'staff'), uploadMiddleware.single('image'), createBanner);
router.put('/:id', authenticate, authorize('super_admin', 'admin', 'staff'), uploadMiddleware.single('image'), updateBanner);
router.delete('/:id', authenticate, authorize('super_admin', 'admin', 'staff'), deleteBanner);

export default router;
