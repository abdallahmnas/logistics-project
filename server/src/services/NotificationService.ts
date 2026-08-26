import { Op } from 'sequelize';
import { Notification, User } from '../models';
import { sendEmail, sendPushNotification, orderStatusEmailTemplate } from '../config/email';

export class NotificationService {
  public static async getUserNotifications(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');
    return Notification.findAll({ where: { userId: user.id }, order: [['createdAt', 'DESC']] });
  }

  public static async markAsRead(id: string, userId: string) {
    const notif = await Notification.findOne({ where: { id, userId } });
    if (!notif) throw new Error('Notification not found');
    notif.isRead = true;
    await notif.save();
    return notif;
  }

  public static async markAllAsRead(userId: string) {
    await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
    return { message: 'All notifications marked as read' };
  }

  public static async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: 'shipment' | 'procurement' | 'exchange' | 'delivery' | 'wallet' | 'system' | 'support';
    referenceId?: string;
  }) {
    return Notification.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      referenceId: data.referenceId,
    });
  }

  /**
   * Send notification to all admin/staff members with matching roles
   */
  public static async notifyAdmins(params: {
    title: string;
    message: string;
    type: 'shipment' | 'procurement' | 'exchange' | 'delivery' | 'wallet' | 'system' | 'support';
    referenceId?: string;
    roles?: string[];
  }) {
    try {
      const targetRoles = params.roles || ['super_admin', 'admin', 'warehouse_cn', 'warehouse_ng', 'clearance_agent', 'procurement', 'finance', 'customer_service'];
      const staffUsers = await User.findAll({ where: { role: { [Op.in]: targetRoles } } });
      
      const notifRecords = staffUsers.map((staff) => ({
        userId: staff.id,
        title: params.title,
        message: params.message,
        type: params.type,
        referenceId: params.referenceId,
      }));

      if (notifRecords.length > 0) {
        await Notification.bulkCreate(notifRecords);
      }
    } catch (err: any) {
      console.error('[NotificationService] Error in notifyAdmins:', err.message);
    }
  }

  /**
   * Real-time Support Ticket Notification Engine (In-App DB + Email + Push)
   * Triggers badge counters for Admins when ticket raised/replied, and for Customer when staff responds/closes
   */
  public static async sendTicketNotification(params: {
    ticketId: string;
    subject: string;
    senderId: string;
    senderRole: string;
    senderName: string;
    customerId: string;
    action: 'created' | 'replied' | 'status_changed';
    newStatus?: string;
  }) {
    try {
      const isStaff = ['super_admin', 'admin', 'customer_service', 'clearance_agent', 'warehouse_cn', 'warehouse_ng', 'procurement', 'finance'].includes(params.senderRole);
      
      if (isStaff || params.action === 'status_changed') {
        // Staff responded or status updated -> Notify Customer
        const customerUser = await User.findOne({ where: { customerId: params.customerId } });
        if (customerUser) {
          const title = params.action === 'status_changed'
            ? `Ticket Status: ${params.newStatus?.toUpperCase()}`
            : `Support Reply from ${params.senderName}`;
          const message = params.action === 'status_changed'
            ? `Your support ticket "${params.subject}" status is now ${params.newStatus?.replace(/_/g, ' ')}.`
            : `New response on ticket "${params.subject}"`;

          // 1. In-App Notification for Customer
          await Notification.create({
            userId: customerUser.id,
            title,
            message,
            type: 'support',
            referenceId: params.ticketId,
          });

          // 2. Email Notification to Customer
          sendEmail(
            customerUser.email,
            `[Hamza RMB Global] Support Ticket Update: #${params.ticketId.slice(0, 8)}`,
            orderStatusEmailTemplate({
              recipientName: `${customerUser.firstName} ${customerUser.lastName}`,
              orderType: 'Shipment',
              orderId: `#${params.ticketId.slice(0, 8)}`,
              newStatus: params.newStatus || 'Replied',
              statusDescription: message,
              actionUrl: `http://localhost:5173/customer/support/${params.ticketId}`,
            })
          ).catch((e) => console.error('[NotificationService] Ticket email failed:', e.message));

          // 3. Push Notification to Customer
          sendPushNotification({
            pushToken: customerUser.pushToken,
            title,
            message,
            data: { ticketId: params.ticketId, type: 'support' },
          }).catch((e) => console.error('[NotificationService] Ticket push failed:', e.message));
        }
      } else {
        // Customer raised ticket or replied -> Notify Admins/Staff
        const title = params.action === 'created'
          ? `New Support Ticket Raised`
          : `New Ticket Reply from ${params.senderName}`;
        const message = `Ticket #${params.ticketId.slice(0, 8)} (${params.subject}) by ${params.senderName}`;

        await this.notifyAdmins({
          title,
          message,
          type: 'support',
          referenceId: params.ticketId,
          roles: ['super_admin', 'admin', 'customer_service'],
        });
      }
    } catch (err: any) {
      console.error('[NotificationService] Error in sendTicketNotification:', err.message);
    }
  }

  /**
   * Multi-Channel Notification Engine (In-App DB + Email + Push Notification)
   * Triggered automatically on every order status update across Shipments, Procurement, Exchange, & Delivery
   */
  public static async sendOrderStatusNotification(params: {
    userIdOrCustomerId: string;
    orderType: 'Shipment' | 'Procurement' | 'Exchange' | 'Delivery';
    orderId: string;
    newStatus: string;
    statusDescription: string;
    actionUrl?: string;
  }) {
    try {
      // Lookup user by primary key OR customerId flexibly
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { id: params.userIdOrCustomerId },
            { customerId: params.userIdOrCustomerId },
          ],
        },
      });

      if (!user) {
        console.warn(`[NotificationService] Target user ${params.userIdOrCustomerId} not found – skipping notification.`);
        return;
      }

      const title = `${params.orderType} Status: ${params.newStatus.toUpperCase().replace(/_/g, ' ')}`;
      const message = `Order ${params.orderId} is now ${params.newStatus.replace(/_/g, ' ')}. ${params.statusDescription}`;
      const notifType = params.orderType.toLowerCase() as any;

      // 1. Save In-App Notification in DB for Customer
      await Notification.create({
        userId: user.id,
        title,
        message,
        type: notifType,
        referenceId: params.orderId,
      });

      // 2. Dispatch Email Notification (Non-blocking)
      sendEmail(
        user.email,
        `[Hamza RMB Global] ${params.orderType} Update: ${params.orderId}`,
        orderStatusEmailTemplate({
          recipientName: `${user.firstName} ${user.lastName}`,
          orderType: params.orderType,
          orderId: params.orderId,
          newStatus: params.newStatus,
          statusDescription: params.statusDescription,
          actionUrl: params.actionUrl || `http://localhost:5173/tracking?id=${params.orderId}`,
        })
      ).catch((e) => console.error('[NotificationService] Email dispatch failed:', e.message));

      // 3. Dispatch Mobile Push Notification (Non-blocking)
      sendPushNotification({
        pushToken: user.pushToken,
        title,
        message,
        data: { orderId: params.orderId, orderType: params.orderType, newStatus: params.newStatus },
      }).catch((e) => console.error('[NotificationService] Push notification failed:', e.message));

    } catch (err: any) {
      console.error('[NotificationService] Error in sendOrderStatusNotification:', err.message);
    }
  }
}
