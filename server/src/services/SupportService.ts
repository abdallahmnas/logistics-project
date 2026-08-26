import { SupportTicket, TicketMessage, User } from '../models';
import { NotificationService } from './NotificationService';

export class SupportService {
  // ─── Create Ticket ────────────────────────────────────────────────────────
  public static async createTicket(userId: string, payload: {
    subject: string;
    message: string;
    category?: string;
    priority?: string;
    referenceId?: string;
    attachments?: string[];
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const ticket = await SupportTicket.create({
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      subject: payload.subject,
      category: (payload.category as any) || 'other',
      status: 'open',
      priority: (payload.priority as any) || 'medium',
      referenceId: payload.referenceId,
    });

    // Add the first message from customer with attachments
    await TicketMessage.create({
      ticketId: ticket.id,
      senderId: userId,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role,
      message: payload.message,
      attachments: payload.attachments || [],
    });

    // Trigger Notification for Admin Team
    NotificationService.sendTicketNotification({
      ticketId: ticket.id,
      subject: ticket.subject,
      senderId: userId,
      senderRole: user.role,
      senderName: `${user.firstName} ${user.lastName}`,
      customerId: user.customerId,
      action: 'created',
    }).catch((err) => console.error('[SupportService] Ticket created notification error:', err.message));

    return this.getTicketById(ticket.id);
  }

  // ─── Get All Tickets ──────────────────────────────────────────────────────
  public static async getTickets(userId: string, userRole: string, userCustomerId: string) {
    const isAdmin = ['super_admin', 'admin', 'finance', 'procurement', 'customer_service'].includes(userRole);

    const where = isAdmin ? {} : { customerId: userCustomerId };
    return SupportTicket.findAll({
      where,
      include: [{ model: TicketMessage, as: 'messages', limit: 1, order: [['createdAt', 'DESC']] }],
      order: [['updatedAt', 'DESC']],
    });
  }

  // ─── Get Single Ticket ────────────────────────────────────────────────────
  public static async getTicketById(ticketId: string, customerId?: string, userRole?: string) {
    const ticket = await SupportTicket.findByPk(ticketId, {
      include: [{ model: TicketMessage, as: 'messages', order: [['createdAt', 'ASC']] }],
    });
    if (!ticket) throw new Error('Ticket not found');
    const staffRoles = ['super_admin', 'admin', 'finance', 'procurement', 'customer_service', 'clearance_agent', 'warehouse_cn', 'warehouse_ng'];
    if (customerId && !staffRoles.includes(userRole || '') && ticket.customerId !== customerId) {
      throw new Error('You cannot access another customer\'s ticket');
    }
    return ticket;
  }

  // ─── Reply to Ticket ──────────────────────────────────────────────────────
  public static async replyToTicket(ticketId: string, userId: string, message: string, attachments?: string[]) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new Error('Ticket not found');
    const staffRoles = ['super_admin', 'admin', 'finance', 'procurement', 'customer_service', 'clearance_agent', 'warehouse_cn', 'warehouse_ng'];
    if (!staffRoles.includes(user.role) && ticket.customerId !== user.customerId) {
      throw new Error('You cannot reply to another customer\'s ticket');
    }

    const msg = await TicketMessage.create({
      ticketId,
      senderId: userId,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: user.role,
      message,
      attachments: attachments || [],
    });

    // Auto-update ticket status
    if (['super_admin', 'admin', 'customer_service'].includes(user.role) && ticket.status === 'open') {
      (ticket as any).status = 'in_progress';
      await ticket.save();
    }

    // Trigger Notification for Admin (if Customer replied) or Customer (if Staff replied)
    NotificationService.sendTicketNotification({
      ticketId: ticket.id,
      subject: ticket.subject,
      senderId: userId,
      senderRole: user.role,
      senderName: `${user.firstName} ${user.lastName}`,
      customerId: ticket.customerId,
      action: 'replied',
    }).catch((err) => console.error('[SupportService] Ticket reply notification error:', err.message));

    return this.getTicketById(ticketId, user.customerId, user.role);
  }

  // ─── Update Ticket Status ─────────────────────────────────────────────────
  public static async updateTicketStatus(ticketId: string, status: string) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const allowed = ['open', 'in_progress', 'resolved', 'closed'];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}`);

    (ticket as any).status = status;
    await ticket.save();

    // Trigger Status Update Notification to Customer
    NotificationService.sendTicketNotification({
      ticketId: ticket.id,
      subject: ticket.subject,
      senderId: 'system',
      senderRole: 'admin',
      senderName: 'Support Team',
      customerId: ticket.customerId,
      action: 'status_changed',
      newStatus: status,
    }).catch((err) => console.error('[SupportService] Ticket status update notification error:', err.message));

    return ticket;
  }
}
