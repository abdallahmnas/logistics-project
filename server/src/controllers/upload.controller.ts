import { Request, Response } from 'express';
import multer from 'multer';
import { uploadToCloudinary, uploadBase64ToCloudinary } from '../config/cloudinary';

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    let folder = req.body?.folder || 'packages';

    // 1. Handle multipart file upload via multer
    if (req.file) {
      const publicId = `${folder}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const url = await uploadToCloudinary(
        req.file.buffer,
        folder,
        publicId,
        req.file.originalname,
        req.file.mimetype
      );
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        url,
      });
      return;
    }

    // 2. Handle base64 JSON payload
    if (req.body && req.body.file) {
      const base64Data = req.body.file;
      const url = await uploadBase64ToCloudinary(base64Data, folder);
      res.status(200).json({
        success: true,
        message: 'Base64 image uploaded successfully to Cloudinary',
        url,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: 'No file or base64 payload provided',
    });
  } catch (error: any) {
    console.error('Upload Endpoint Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'File upload failed',
    });
  }
};
