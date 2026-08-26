import React, { useEffect } from 'react';
import { Card, Button, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  InboxOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  CarOutlined,
  WalletOutlined,
  SettingOutlined,
  CheckOutlined,
  CustomerServiceOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchNotifications, markAllAsRead, markAsRead, type NotificationItem } from '../../../store/slices/notificationSlice';
import { formatRelativeTime, formatDate } from '../../../utils/formatters';

const typeIcon: Record<NotificationItem['type'], React.ReactNode> = {
  shipment: <InboxOutlined />,
  procurement: <ShoppingCartOutlined />,
  exchange: <SwapOutlined />,
  delivery: <CarOutlined />,
  wallet: <WalletOutlined />,
  system: <SettingOutlined />,
  support: <CustomerServiceOutlined />,
};

const typeColor: Record<NotificationItem['type'], string> = {
  shipment: 'bg-blue-100 text-blue-600',
  procurement: 'bg-purple-100 text-purple-600',
  exchange: 'bg-green-100 text-green-600',
  delivery: 'bg-orange-100 text-orange-600',
  wallet: 'bg-amber-100 text-amber-600',
  system: 'bg-slate-100 text-slate-600',
  support: 'bg-indigo-100 text-indigo-600',
};

const groupByDate = (notifications: NotificationItem[]) => {
  const groups: Record<string, NotificationItem[]> = {};
  notifications.forEach((n) => {
    const key = formatDate(n.createdAt || '');
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
};

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (notifications.length === 0) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, notifications.length]);

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const grouped = groupByDate(sorted);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Notifications</h1>
          <p className="text-slate-500 mt-1 mb-0 text-sm">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You are all caught up'}
          </p>
        </div>
        <Button icon={<CheckOutlined />} disabled={unreadCount === 0} onClick={() => dispatch(markAllAsRead())}>
          Mark all as read
        </Button>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl" loading={loading && notifications.length === 0}>
        {sorted.length === 0 && !loading ? (
          <Empty description="No notifications yet" className="py-8" />
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{date}</h4>
                <div className="space-y-2">
                  {items.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        dispatch(markAsRead(notif.id));
                        if (notif.type === 'support') {
                          navigate(notif.referenceId ? `/customer/support/${notif.referenceId}` : '/customer/support');
                        } else if (notif.type === 'shipment') {
                          navigate('/customer/shipments');
                        } else if (notif.type === 'procurement') {
                          navigate('/customer/buy-for-me');
                        } else if (notif.type === 'exchange') {
                          navigate('/customer/exchange');
                        } else if (notif.type === 'delivery') {
                          navigate('/customer/delivery');
                        }
                      }}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        notif.isRead
                          ? 'bg-white border-slate-100 hover:bg-slate-50'
                          : 'bg-blue-50/60 border-blue-200 border-l-4 border-l-brand-orange hover:bg-blue-100/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeColor[notif.type] || typeColor.system}`}>
                        {typeIcon[notif.type] || typeIcon.system}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`m-0 ${notif.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-slate-500 m-0 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-400 m-0 mt-2">{formatRelativeTime(notif.createdAt || '')}</p>
                      </div>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-brand-blue mt-2 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
