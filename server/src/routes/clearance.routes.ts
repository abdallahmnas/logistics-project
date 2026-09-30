import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import {
  createClearanceRequest,
  updateClearanceRequest,
  getCustomerClearanceRequests,
  getAllClearanceRequests,
  getClearanceRequestById,
  updateClearanceStatus,
  addClearanceCharge,
  uploadClearanceDocument,
  addClearanceMessage,
  payClearanceCharges,
  cancelClearanceRequest,
} from '../controllers/clearance.controller';

const router = Router();

router.use(authenticate);

// Admin-specific endpoints
router.get(
  '/admin/all',
  authorize('super_admin', 'admin', 'clearance_agent'),
  getAllClearanceRequests
);
router.patch(
  '/admin/requests/:id/status',
  authorize('super_admin', 'admin', 'clearance_agent'),
  updateClearanceStatus
);
router.put(
  '/admin/requests/:id/status',
  authorize('super_admin', 'admin', 'clearance_agent'),
  updateClearanceStatus
);
router.post(
  '/admin/requests/:id/charges',
  authorize('super_admin', 'admin', 'clearance_agent'),
  addClearanceCharge
);

// Clearance Requests creation & list
router.post('/', createClearanceRequest);
router.post('/requests', createClearanceRequest);
router.get('/', getCustomerClearanceRequests);
router.get('/requests', getCustomerClearanceRequests);

// Clearance Request by ID (Customer & Admin)
router.get('/:id', getClearanceRequestById);
router.get('/requests/:id', getClearanceRequestById);
router.put('/:id', updateClearanceRequest);
router.put('/requests/:id', updateClearanceRequest);

// Modify status (accessible by authorized staff / clearance agents)
router.patch(
  '/:id/status',
  authorize('super_admin', 'admin', 'clearance_agent'),
  updateClearanceStatus
);
router.patch(
  '/requests/:id/status',
  authorize('super_admin', 'admin', 'clearance_agent'),
  updateClearanceStatus
);
router.put(
  '/:id/status',
  authorize('super_admin', 'admin', 'clearance_agent'),
  updateClearanceStatus
);
router.put(
  '/requests/:id/status',
  authorize('super_admin', 'admin', 'clearance_agent'),
  updateClearanceStatus
);

// Charges
router.post(
  '/:id/charges',
  authorize('super_admin', 'admin', 'clearance_agent'),
  addClearanceCharge
);
router.post(
  '/requests/:id/charges',
  authorize('super_admin', 'admin', 'clearance_agent'),
  addClearanceCharge
);

// Documents & Messages
router.post('/:id/documents', uploadClearanceDocument);
router.post('/requests/:id/documents', uploadClearanceDocument);
router.post('/:id/messages', addClearanceMessage);
router.post('/requests/:id/messages', addClearanceMessage);

// Customer payment & cancel
router.post('/:id/pay', payClearanceCharges);
router.post('/requests/:id/pay', payClearanceCharges);
router.post('/:id/cancel', cancelClearanceRequest);
router.post('/requests/:id/cancel', cancelClearanceRequest);

export default router;
