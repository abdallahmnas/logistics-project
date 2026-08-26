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
    type: 'shipment' | 'procurement' | 'exchange' | 'delivery' | 'wallet' | 'system';
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
      const targetRoles = params.roles || ['super_admin', 'admin', 'warehouse_cn', 'warehouse_ng', 'clearance_agent', 'procurement', 'finance'];
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
        `[Logicore] ${params.orderType} Update: ${params.orderId}`,
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
