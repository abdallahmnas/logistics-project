import { Request, Response } from 'express';
import { BannerService } from '../services/BannerService';
import { uploadToCloudinary } from '../config/cloudinary';

export const getActiveBanners = async (_req: Request, res: Response): Promise<void> => {
  try {
    const banners = await BannerService.getActiveBanners();
    res.status(200).json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBannersAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const banners = await BannerService.getAllBannersAdmin();
    res.status(200).json({ success: true, data: banners });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      const publicId = `banner_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        'banners',
        publicId,
        req.file.originalname,
        req.file.mimetype
      );
    }

    if (!imageUrl) {
      res.status(400).json({ success: false, message: 'Banner image or file upload is required' });
      return;
    }

    const adminUser = { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email };
    const banner = await BannerService.createBanner(
      {
        title: req.body.title,
        subtitle: req.body.subtitle,
        imageUrl,
        linkUrl: req.body.linkUrl,
        targetScreen: req.body.targetScreen,
        displayOrder: req.body.displayOrder ? Number(req.body.displayOrder) : 0,
        isActive: req.body.isActive === 'false' || req.body.isActive === false ? false : true,
      },
      adminUser
    );

    res.status(201).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    let imageUrl = req.body.imageUrl;

    if (req.file) {
      const publicId = `banner_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      imageUrl = await uploadToCloudinary(
        req.file.buffer,
        'banners',
        publicId,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const adminUser = { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email };
    const updateData: any = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.subtitle !== undefined) updateData.subtitle = req.body.subtitle;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (req.body.linkUrl !== undefined) updateData.linkUrl = req.body.linkUrl;
    if (req.body.targetScreen !== undefined) updateData.targetScreen = req.body.targetScreen;
    if (req.body.displayOrder !== undefined) updateData.displayOrder = Number(req.body.displayOrder);
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive === 'true' || req.body.isActive === true;

    const banner = await BannerService.updateBanner(id, updateData, adminUser);
    res.status(200).json({ success: true, data: banner });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBanner = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const adminUser = { id: user.id, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email };
    await BannerService.deleteBanner(id, adminUser);
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
