import { Router } from 'express';
import { uploadFile, uploadMiddleware } from '../controllers/upload.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/v1/upload
router.post('/', authenticate, uploadMiddleware.single('file'), uploadFile);

export default router;
