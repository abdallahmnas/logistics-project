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
      // Lookup user by primary key OR customerId
      let user = await User.findByPk(params.userIdOrCustomerId);
      if (!user) {
        user = await User.findOne({ where: { customerId: params.userIdOrCustomerId } });
      }

      if (!user) {
        console.warn(`[NotificationService] Target user ${params.userIdOrCustomerId} not found – skipping notification.`);
        return;
      }

      const title = `${params.orderType} Status: ${params.newStatus.toUpperCase().replace(/_/g, ' ')}`;
      const message = `Order ${params.orderId} is now ${params.newStatus.replace(/_/g, ' ')}. ${params.statusDescription}`;
      const notifType = params.orderType.toLowerCase() as any;

      // 1. Save In-App Notification in DB
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
