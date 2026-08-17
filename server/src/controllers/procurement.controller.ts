import { Request, Response } from 'express';
import { ProcurementService } from '../services/ProcurementService';

export const createProcurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const proc = await ProcurementService.createRequest(userId, req.body);
    res.status(201).json({ success: true, data: proc });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProcurements = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const customerId = user.role === 'customer' ? user.customerId : undefined;
    const list = await ProcurementService.getRequests(customerId);
    res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const quoteProcurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const quoted = await ProcurementService.quoteRequest(id, req.body);
    res.status(200).json({ success: true, data: quoted });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const approveProcurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const approved = await ProcurementService.approveRequest(id, (req as any).user.customerId);
    res.status(200).json({ success: true, data: approved });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProcurementStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await ProcurementService.updateStatus(id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
