import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import {
  getActiveRate,
  createExchange,
  getExchanges,
  updateRate,
  verifyNairaPayment,
  releaseRmb,
  rejectExchange,
  uploadReceipt,
  getSavedAccounts,
  createSavedAccount,
  deleteSavedAccount,
  setDefaultAccount,
} from '../controllers/exchange.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Public
router.get('/rate', getActiveRate);

// Authenticated
router.use(authenticate);

router.get('/saved-accounts', getSavedAccounts);
router.post('/saved-accounts', createSavedAccount);
router.delete('/saved-accounts/:id', deleteSavedAccount);
router.patch('/saved-accounts/:id/default', setDefaultAccount);

router.post('/', createExchange);
router.get('/', getExchanges);
router.post('/rate', authorize('super_admin', 'admin', 'finance'), permissionMiddleware('exchange', 'update'), updateRate);
router.patch('/:id/verify-naira', authorize('super_admin', 'admin', 'finance'), permissionMiddleware('exchange', 'approve'), verifyNairaPayment);
router.patch('/:id/release-rmb', authorize('super_admin', 'admin', 'finance'), permissionMiddleware('exchange', 'approve'), releaseRmb);
router.patch('/:id/reject', authorize('super_admin', 'admin', 'finance'), permissionMiddleware('exchange', 'reject'), rejectExchange);
router.post('/:id/receipt', upload.single('receipt'), uploadReceipt);

export default router;
