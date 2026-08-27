import { Request, Response } from 'express';
import { PermissionGroupService } from '../services/PermissionGroupService';
import { PermissionService } from '../services/PermissionService';

export const getAllGroups = async (_req: Request, res: Response): Promise<void> => {
  try {
    const groups = await PermissionGroupService.getAll();
    res.status(200).json({ success: true, data: groups });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroupById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const group = await PermissionGroupService.getById(groupId);
    res.status(200).json({ success: true, data: group });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const group = await PermissionGroupService.create(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const group = await PermissionGroupService.update(groupId, req.body);
    res.status(200).json({ success: true, data: group });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const result = await PermissionGroupService.delete(groupId);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPermissionsByGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const permissions = await PermissionService.getByGroupId(groupId);
    res.status(200).json({ success: true, data: permissions });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createPermissionForGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const perm = await PermissionService.create({
      permissionGroupId: groupId,
      ...req.body,
    });
    res.status(201).json({ success: true, data: perm });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { permissionId } = req.params;
    const perm = await PermissionService.update(permissionId, req.body);
    res.status(200).json({ success: true, data: perm });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { permissionId } = req.params;
    const result = await PermissionService.delete(permissionId);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
