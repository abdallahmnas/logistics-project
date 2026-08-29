import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { uploadMiddleware } from '../controllers/upload.controller';
import {
  createDelivery,
  getDeliveries,
  assignDriver,
  updateDeliveryStatus,
  getVehicles,
  getAllVehiclesAdmin,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/delivery.controller';

const router = Router();

router.use(authenticate);

// Vehicle Endpoints
router.get('/vehicles', getVehicles);
router.get('/admin/vehicles', authorize('super_admin', 'admin', 'warehouse_ng', 'staff', 'finance'), getAllVehiclesAdmin);
router.post('/admin/vehicles', authorize('super_admin', 'admin', 'warehouse_ng', 'staff'), uploadMiddleware.single('image'), createVehicle);
router.put('/admin/vehicles/:id', authorize('super_admin', 'admin', 'warehouse_ng', 'staff'), uploadMiddleware.single('image'), updateVehicle);
router.delete('/admin/vehicles/:id', authorize('super_admin', 'admin', 'warehouse_ng', 'staff'), deleteVehicle);

// Delivery Endpoints
router.post('/', createDelivery);
router.get('/', getDeliveries);
router.post('/:id/driver', authorize('super_admin', 'admin', 'warehouse_ng', 'driver', 'staff'), assignDriver);
router.patch('/:id/status', authorize('super_admin', 'admin', 'warehouse_ng', 'driver', 'staff'), updateDeliveryStatus);
router.put('/:id/status', authorize('super_admin', 'admin', 'warehouse_ng', 'driver', 'staff'), updateDeliveryStatus);

export default router;
