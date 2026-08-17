import { Request, Response } from 'express';
import { FacilityService } from '../services/FacilityService';

export const getFacilities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const facilities = await FacilityService.getAllFacilities();
    res.status(200).json({ status: 'success', data: facilities });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getFacilityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const facility = await FacilityService.getFacilityById(id);
    res.status(200).json({ status: 'success', data: facility });
  } catch (error: any) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};

export const createFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const adminUser = user ? { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role } : undefined;
    const facility = await FacilityService.createFacility(req.body, adminUser);
    res.status(201).json({ status: 'success', data: facility });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const adminUser = user ? { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role } : undefined;
    const facility = await FacilityService.updateFacility(id, req.body, adminUser);
    res.status(200).json({ status: 'success', data: facility });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const adminUser = user ? { id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role } : undefined;
    const result = await FacilityService.deleteFacility(id, adminUser);
    res.status(200).json({ status: 'success', message: result.message });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
