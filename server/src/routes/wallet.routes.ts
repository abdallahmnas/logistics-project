import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../controllers/upload.controller';
import {
  getWallet,
  submitDeposit,
  getCustomerDeposits,
  getAllDepositsAdmin,
  approveDepositAdmin,
  rejectDepositAdmin,
  getTransactions,
} from '../controllers/wallet.controller';

const router = Router();

router.use(authenticate);

router.get('/', getWallet);
router.get('/transactions', getTransactions);

// Customer manual wallet funding endpoints
router.post('/deposit', uploadMiddleware.single('receipt'), submitDeposit);
router.get('/deposits', getCustomerDeposits);

// Admin/Staff top-up verification endpoints
router.get(
  '/admin/deposits',
  authorize('super_admin', 'admin', 'financial', 'staff', 'procurement', 'warehouse_ng'),
  getAllDepositsAdmin
);
router.post(
  '/admin/deposits/:id/approve',
  authorize('super_admin', 'admin', 'financial', 'staff', 'procurement', 'warehouse_ng'),
  approveDepositAdmin
);
router.post(
  '/admin/deposits/:id/reject',
  authorize('super_admin', 'admin', 'financial', 'staff', 'procurement', 'warehouse_ng'),
  rejectDepositAdmin
);

export default router;
