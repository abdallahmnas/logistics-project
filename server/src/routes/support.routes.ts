import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createTicket, getTickets, getTicket, replyToTicket, updateTicketStatus } from '../controllers/support.controller';
import { uploadMiddleware } from '../controllers/upload.controller';

import { handleChatMessage } from '../controllers/chatbot.controller';

const router = Router();

// Public / Authenticated Chatbot endpoint
router.post('/chat', handleChatMessage);

router.use(authenticate);

router.post('/', uploadMiddleware.any(), createTicket);
router.get('/', getTickets);
router.get('/:id', getTicket);
router.post('/:id/reply', uploadMiddleware.any(), replyToTicket);
router.patch('/:id/status', authorize('super_admin', 'admin'), updateTicketStatus);

export default router;
