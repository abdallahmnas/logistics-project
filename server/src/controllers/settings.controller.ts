import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SettingsService.getSettings();
    res.json({
      status: 'success',
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch platform settings',
    });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const adminUser = user ? { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role } : undefined;

    const updated = await SettingsService.updateSettings(req.body, adminUser);
    res.json({
      status: 'success',
      message: 'Platform settings updated successfully',
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update platform settings',
    });
  }
};
