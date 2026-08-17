import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getWallet, topUpWallet, getTransactions } from '../controllers/wallet.controller';

const router = Router();

router.use(authenticate);

router.get('/', getWallet);
router.post('/top-up', topUpWallet);
router.get('/transactions', getTransactions);

export default router;
