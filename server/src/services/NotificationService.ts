import { Notification, User } from '../models';

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
}
