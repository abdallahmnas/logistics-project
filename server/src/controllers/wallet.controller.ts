import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';

export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const wallet = await WalletService.getWalletByUserId(userId);
    res.status(200).json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const topUpWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { amount, paymentMethod } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Invalid top-up amount' });
      return;
    }
    const wallet = await WalletService.topUpWallet(userId, amount, paymentMethod || 'bank_transfer');
    res.status(200).json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const txs = await WalletService.getTransactions(userId);
    res.status(200).json({ success: true, data: txs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
