import { Request, Response } from 'express';
import { ExchangeService } from '../services/ExchangeService';

export const getActiveRate = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rate = await ExchangeService.getActiveRate();
    res.status(200).json({ success: true, data: rate });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExchange = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const exchange = await ExchangeService.createExchange(userId, req.body);
    res.status(201).json({ success: true, data: exchange });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getExchanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const customerId = user.role === 'customer' ? user.customerId : undefined;
    const list = await ExchangeService.getExchanges(customerId);
    res.status(200).json({ success: true, data: list });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRate = async (req: Request, res: Response): Promise<void> => {
  try {
    const rate = await ExchangeService.updateRate(req.body);
    res.status(200).json({ success: true, data: rate });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyNairaPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;
    const exchange = await ExchangeService.verifyNairaPayment(id, adminId);
    res.status(200).json({ success: true, data: exchange });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const releaseRmb = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;
    const exchange = await ExchangeService.releaseRmb(id, adminId);
    res.status(200).json({ success: true, data: exchange });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const uploadReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const photoBuffer = (req as any).file?.buffer;
    if (!photoBuffer) { res.status(400).json({ success: false, message: 'No receipt file provided' }); return; }
    const exchange = await ExchangeService.uploadReceipt(id, (req as any).user.customerId, photoBuffer);
    res.status(200).json({ success: true, data: exchange });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
