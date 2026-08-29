import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';
import { uploadToCloudinary } from '../config/cloudinary';

export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const wallet = await WalletService.getWalletByUserId(userId);
    res.status(200).json({ success: true, data: wallet });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { amount, senderName, sessionId, paymentReceiptUrl: existingUrl } = req.body;

    let receiptUrl = existingUrl;

    if (req.file) {
      const publicId = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      receiptUrl = await uploadToCloudinary(
        req.file.buffer,
        'wallet_receipts',
        publicId,
        req.file.originalname,
        req.file.mimetype
      );
    }

    if (!receiptUrl) {
      res.status(400).json({ success: false, message: 'Please upload your payment receipt photo or PDF file.' });
      return;
    }

    const deposit = await WalletService.submitDepositRequest(userId, {
      amount: Number(amount),
      senderName,
      sessionId,
      paymentReceiptUrl: receiptUrl,
    });

    res.status(201).json({ success: true, data: deposit });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getCustomerDeposits = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const deposits = await WalletService.getCustomerDeposits(userId);
    res.status(200).json({ success: true, data: deposits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDepositsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const deposits = await WalletService.getAllDepositsAdmin(status);
    res.status(200).json({ success: true, data: deposits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveDepositAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const depositId = req.params.id;
    const adminUser = {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    };
    const result = await WalletService.approveDepositAdmin(depositId, adminUser);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rejectDepositAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const depositId = req.params.id;
    const { rejectionReason } = req.body;
    const adminUser = {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    };
    const result = await WalletService.rejectDepositAdmin(depositId, adminUser, rejectionReason);
    res.status(200).json({ success: true, data: result });
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
