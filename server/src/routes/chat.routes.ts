import { Router } from 'express';
import { chatWithAisha } from '../controllers/chatController';

const router = Router();

// Public chat endpoint (accessible to visitors & authenticated users)
router.post('/chat', chatWithAisha);
router.post('/', chatWithAisha);

export default router;
