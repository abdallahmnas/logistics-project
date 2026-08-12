import { Request, Response } from 'express';
import { SupportService } from '../services/SupportService';

export const createTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const ticket = await SupportService.createTicket(userId, req.body);
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
    const ticket = await SupportService.getTicketById(id);
    res.status(200).json({ success: true, data: ticket });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { message, attachments } = req.body;
    if (!message) { res.status(400).json({ success: false, message: 'Message is required' }); return; }
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
