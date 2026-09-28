import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createClearanceRequest,
  updateClearanceRequest,
  getCustomerClearanceRequests,
  getClearanceRequestById,
  uploadClearanceDocument,
  addClearanceMessage,
  payClearanceCharges,
  cancelClearanceRequest,
} from '../controllers/clearance.controller';

const router = Router();

router.use(authenticate);

router.post('/', createClearanceRequest);
router.post('/requests', createClearanceRequest);
router.get('/', getCustomerClearanceRequests);
router.get('/requests', getCustomerClearanceRequests);
router.get('/:id', getClearanceRequestById);
router.get('/requests/:id', getClearanceRequestById);
router.put('/:id', updateClearanceRequest);
router.put('/requests/:id', updateClearanceRequest);
router.post('/:id/documents', uploadClearanceDocument);
router.post('/requests/:id/documents', uploadClearanceDocument);
router.post('/:id/messages', addClearanceMessage);
router.post('/requests/:id/messages', addClearanceMessage);
router.post('/:id/pay', payClearanceCharges);
router.post('/requests/:id/pay', payClearanceCharges);
router.post('/:id/cancel', cancelClearanceRequest);
router.post('/requests/:id/cancel', cancelClearanceRequest);

export default router;
