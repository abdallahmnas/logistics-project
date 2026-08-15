import { Router } from 'express';
import { uploadFile, uploadMiddleware } from '../controllers/upload.controller';

const router = Router();

// POST /api/v1/upload
router.post('/', uploadMiddleware.single('file'), uploadFile);

export default router;
