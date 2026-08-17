import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createTicket, getTickets, getTicket, replyToTicket, updateTicketStatus } from '../controllers/support.controller';

const router = Router();

router.use(authenticate);

router.post('/', createTicket);
router.get('/', getTickets);
router.get('/:id', getTicket);
router.post('/:id/reply', replyToTicket);
router.patch('/:id/status', authorize('super_admin', 'admin'), updateTicketStatus);

export default router;
