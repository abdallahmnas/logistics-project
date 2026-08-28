import { Request, Response } from 'express';
import { ProcurementService } from '../services/ProcurementService';
import { uploadToCloudinary } from '../config/cloudinary';

export const createProcurement = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    let uploadedPhotoUrls: string[] = [];

    // Process multipart binary files uploaded via multer
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files as Express.Multer.File[]) {
        const publicId = `procurement_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const url = await uploadToCloudinary(
          file.buffer,
          'procurement',
          publicId,
          file.originalname,
          file.mimetype
        );
        uploadedPhotoUrls.push(url);
      }
    }

    let existingPhotos: string[] = [];
    if (req.body.productPhotos) {
      if (Array.isArray(req.body.productPhotos)) {
        existingPhotos = req.body.productPhotos;
      } else if (typeof req.body.productPhotos === 'string') {
        try {
          existingPhotos = JSON.parse(req.body.productPhotos);
        } catch {
          existingPhotos = [req.body.productPhotos];
        }
      }
    }

    const payload = {
      ...req.body,
      quantity: req.body.quantity ? Number(req.body.quantity) : 1,
      productPhotos: [...uploadedPhotoUrls, ...existingPhotos],
    };

    const proc = await ProcurementService.createRequest(userId, payload);
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
