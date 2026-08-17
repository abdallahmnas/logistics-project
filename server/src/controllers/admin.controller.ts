import { Request, Response } from 'express';
import { AdminService } from '../services/AdminService';
import { ActivityLogService } from '../services/ActivityLogService';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await AdminService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await AdminService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStaffMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await AdminService.createStaffMember(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await AdminService.updateUser(id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await AdminService.deleteUser(id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPermissionGroups = async (_req: Request, res: Response): Promise<void> => {
  try { res.status(200).json({ success: true, data: await AdminService.getPermissionGroups() }); }
  catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const createPermissionGroup = async (req: Request, res: Response): Promise<void> => {
  try { res.status(201).json({ success: true, data: await AdminService.createPermissionGroup(req.body) }); }
  catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
};

export const updatePermissionGroup = async (req: Request, res: Response): Promise<void> => {
  try { res.status(200).json({ success: true, data: await AdminService.updatePermissionGroup(req.params.id, req.body) }); }
  catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
};

export const deletePermissionGroup = async (req: Request, res: Response): Promise<void> => {
  try { res.status(200).json({ success: true, data: await AdminService.deletePermissionGroup(req.params.id) }); }
  catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
};

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { module, search, limit, offset } = req.query;
    const data = await ActivityLogService.getActivityLogs({
      module: module as string,
      search: search as string,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
