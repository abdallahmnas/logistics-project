import { Request, Response } from 'express';
import { DeliveryService } from '../services/DeliveryService';
import { DeliveryVehicleService } from '../services/DeliveryVehicleService';
import { uploadToCloudinary } from '../config/cloudinary';

export const createDelivery = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const del = await DeliveryService.createDelivery(userId, req.body);
    res.status(201).json({ success: true, data: del });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDeliveries = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const customerId = user.role === 'customer' ? user.customerId : undefined;
    const list = await DeliveryService.getDeliveries(customerId);
    res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDriver = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await DeliveryService.assignDriver(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateDeliveryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, driverName, driverPhone } = req.body;
    const updated = await DeliveryService.updateStatus(id, status, { notes, driverName, driverPhone });
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Vehicle CRUD Controllers
export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await DeliveryVehicleService.getActiveVehicles();
    res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllVehiclesAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const list = await DeliveryVehicleService.getAllVehiclesAdmin();
    res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      const publicId = `vehicle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        'vehicles',
        publicId,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const adminUser = { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email };
    const vehicle = await DeliveryVehicleService.createVehicle(
      {
        name: req.body.name,
        type: req.body.type || 'sedan',
        description: req.body.description,
        priceLagos: Number(req.body.priceLagos || 2500),
        priceKano: Number(req.body.priceKano || 2000),
        priceInterstate: Number(req.body.priceInterstate || 7500),
        perKmRate: req.body.perKmRate ? Number(req.body.perKmRate) : undefined,
        maxWeightKg: req.body.maxWeightKg ? Number(req.body.maxWeightKg) : undefined,
        imageUrl,
        isActive: req.body.isActive === 'false' || req.body.isActive === false ? false : true,
      },
      adminUser
    );

    res.status(201).json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      const publicId = `vehicle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        'vehicles',
        publicId,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const adminUser = { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email };
    const updateData: any = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.priceLagos !== undefined) updateData.priceLagos = Number(req.body.priceLagos);
    if (req.body.priceKano !== undefined) updateData.priceKano = Number(req.body.priceKano);
    if (req.body.priceInterstate !== undefined) updateData.priceInterstate = Number(req.body.priceInterstate);
    if (req.body.perKmRate !== undefined) updateData.perKmRate = Number(req.body.perKmRate);
    if (req.body.maxWeightKg !== undefined) updateData.maxWeightKg = Number(req.body.maxWeightKg);
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;

    const vehicle = await DeliveryVehicleService.updateVehicle(id, updateData, adminUser);
    res.status(200).json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const adminUser = { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email };
    await DeliveryVehicleService.deleteVehicle(id, adminUser);
    res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
