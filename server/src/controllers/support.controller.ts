import { Request, Response } from 'express';
import { SupportService } from '../services/SupportService';
import { uploadToCloudinary, uploadBase64ToCloudinary } from '../config/cloudinary';

const processAttachments = async (req: Request, prefix: string): Promise<string[]> => {
  const attachments: string[] = [];

  // 1. Files uploaded via multer multipart
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    for (const file of req.files as Express.Multer.File[]) {
      const publicId = `support_${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const url = await uploadToCloudinary(file.buffer, 'support_tickets', publicId);
      attachments.push(url);
    }
  } else if (req.file) {
    const publicId = `support_${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const url = await uploadToCloudinary(req.file.buffer, 'support_tickets', publicId);
    attachments.push(url);
  }

  // 2. Base64 or string URLs passed in req.body.attachments
  if (req.body.attachments) {
    let bodyAttachments = req.body.attachments;
    if (typeof bodyAttachments === 'string') {
      try {
        bodyAttachments = JSON.parse(bodyAttachments);
      } catch {
        bodyAttachments = [bodyAttachments];
      }
    }
    if (Array.isArray(bodyAttachments)) {
      for (const item of bodyAttachments) {
        if (typeof item === 'string' && item.startsWith('data:')) {
          const url = await uploadBase64ToCloudinary(item, 'support_tickets');
          attachments.push(url);
        } else if (typeof item === 'string' && item.trim().length > 0) {
          attachments.push(item);
        }
      }
    }
  }

  return attachments;
};

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const attachments = await processAttachments(req, 'ticket');
    const ticket = await SupportService.createTicket(userId, {
      ...req.body,
      attachments,
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTickets = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const tickets = await SupportService.getTickets(user.id, user.role, user.customerId);
    res.status(200).json({ success: true, data: tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const ticket = await SupportService.getTicketById(id, user.customerId, user.role);
    res.status(200).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { message } = req.body;
    if (!message) { res.status(400).json({ success: false, message: 'Message is required' }); return; }

    const attachments = await processAttachments(req, 'reply');
    const ticket = await SupportService.replyToTicket(id, userId, message, attachments);
    res.status(201).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await SupportService.updateTicketStatus(id, status);
    res.status(200).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
