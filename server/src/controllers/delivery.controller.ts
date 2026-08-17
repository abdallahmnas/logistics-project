import { Request, Response } from 'express';
import { DeliveryService } from '../services/DeliveryService';

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
    const { status } = req.body;
    const updated = await DeliveryService.updateStatus(id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
