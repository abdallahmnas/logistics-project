import { Request, Response } from 'express';
import { ClearanceService } from '../services/ClearanceService';

export const createClearanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const clearanceRequest = await ClearanceService.createClearanceRequest(user.id, req.body);
    res.status(201).json({ status: 'success', data: clearanceRequest });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateClearanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const clearanceRequest = await ClearanceService.updateClearanceRequest(id, user.id, req.body);
    res.status(200).json({ status: 'success', data: clearanceRequest });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getCustomerClearanceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { status, search, all } = req.query as { status?: string; search?: string; all?: string };
    const isAdmin = ['super_admin', 'admin', 'clearance_agent'].includes(user.role);

    let requests;
    if (isAdmin && (all === 'true' || req.query.adminView === 'true')) {
      requests = await ClearanceService.getAllClearanceRequests({ status, search });
    } else {
      requests = await ClearanceService.getCustomerClearanceRequests(user.id, { status, search });
    }

    res.status(200).json({ status: 'success', data: requests });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getAllClearanceRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { status, search, shipmentType } = req.query as {
      status?: string;
      search?: string;
      shipmentType?: string;
    };
    const requests = await ClearanceService.getAllClearanceRequests({ status, search, shipmentType });
    res.status(200).json({ status: 'success', data: requests });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getClearanceRequestById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const isAdmin = ['super_admin', 'admin', 'clearance_agent'].includes(user.role);
    const clearanceRequest = await ClearanceService.getClearanceRequestById(
      id,
      isAdmin ? undefined : user.id
    );
    res.status(200).json({ status: 'success', data: clearanceRequest });
  } catch (error: any) {
    res.status(404).json({ status: 'error', message: error.message });
  }
};

export const updateClearanceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { status, note, requiredActionNote } = req.body;
    if (!status) {
      res.status(400).json({ status: 'error', message: 'New status is required' });
      return;
    }

    const updatedRequest = await ClearanceService.updateRequestStatus(
      id,
      user,
      status,
      note,
      requiredActionNote
    );
    res.status(200).json({
      status: 'success',
      data: updatedRequest,
      message: `Clearance status updated to ${status} successfully`,
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const addClearanceCharge = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const charge = await ClearanceService.addCharge(id, req.body);
    res.status(201).json({ status: 'success', data: charge, message: 'Charge added successfully' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const uploadClearanceDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const document = await ClearanceService.uploadDocument(id, user.id, req.body);
    res.status(201).json({ status: 'success', data: document });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const addClearanceMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { message, attachmentUrl } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ status: 'error', message: 'Message text is required' });
      return;
    }

    const msg = await ClearanceService.addMessage(id, user.id, message, attachmentUrl);
    res.status(201).json({ status: 'success', data: msg });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const payClearanceCharges = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const updatedRequest = await ClearanceService.payCharges(id, user.id);
    res.status(200).json({ status: 'success', data: updatedRequest, message: 'Clearance charges paid successfully' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const cancelClearanceRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { reason } = req.body;
    const cancelledRequest = await ClearanceService.cancelClearanceRequest(id, user.id, reason);
    res.status(200).json({ status: 'success', data: cancelledRequest, message: 'Clearance request cancelled' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
