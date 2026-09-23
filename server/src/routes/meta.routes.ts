import { Router } from 'express';
import { getMetadataOptions } from '../controllers/meta.controller';

const router = Router();

// Public metadata endpoints
router.get('/', getMetadataOptions);
router.get('/options', getMetadataOptions);
router.get('/statuses-and-categories', getMetadataOptions);
router.get('/categories', getMetadataOptions);

export default router;
