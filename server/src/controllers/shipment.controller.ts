import { Request, Response } from 'express';
import { ShipmentService } from '../services/ShipmentService';

export const createPreAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const pkg = await ShipmentService.createPreAlert(userId, req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPackages = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const packages = user.role === 'customer'
      ? await ShipmentService.getCustomerPackages(user.customerId)
      : await ShipmentService.getAllPackages();
    res.status(200).json({ success: true, data: packages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackingId } = req.params;
    const pkg = await ShipmentService.trackPackage(decodeURIComponent(trackingId));
    res.status(200).json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const consolidatePackages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const consolidation = await ShipmentService.consolidatePackages(userId, req.body);
    res.status(201).json({ success: true, data: consolidation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getConsolidations = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const customerId = user.role === 'customer' ? user.customerId : undefined;
    const consolidations = await ShipmentService.getConsolidations(customerId);
    res.status(200).json({ success: true, data: consolidations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateConsolidation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).user;
    const consolidation = await ShipmentService.updateConsolidationPackages(id, req.body, adminUser);
    res.status(200).json({ success: true, data: consolidation });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const batch = await ShipmentService.createBatch(req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBatches = async (_req: Request, res: Response): Promise<void> => {
  try {
    const batches = await ShipmentService.getBatches();
    res.status(200).json({ success: true, data: batches });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addPackagesToBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { packageIds } = req.body;
    const batch = await ShipmentService.addPackagesToBatch(id, packageIds);
    res.status(200).json({ success: true, data: batch });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const scanPackageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pkg = await ShipmentService.scanPackage(id, req.body);
    res.status(200).json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adminCreatePackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const pkg = await ShipmentService.adminCreatePackage(req.body);
    res.status(201).json({ success: true, data: pkg });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePackageStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, weightKg, cbm, photos } = req.body;
    const updated = await ShipmentService.updatePackageStatus(id, status, { weightKg, cbm, photos });
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
