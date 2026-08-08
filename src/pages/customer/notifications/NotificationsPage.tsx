import React, { useEffect } from 'react';
import { Card, Button, Empty } from 'antd';
import {
  InboxOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  CarOutlined,
  WalletOutlined,
  SettingOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchNotifications, markAllAsRead, markAsRead } from '../../../store/slices/notificationSlice';
import { formatRelativeTime, formatDate } from '../../../utils/formatters';
import type { MockNotification } from '../../../api/mockData';

const typeIcon: Record<MockNotification['type'], React.ReactNode> = {
  shipment: <InboxOutlined />,
  procurement: <ShoppingCartOutlined />,
  exchange: <SwapOutlined />,
  delivery: <CarOutlined />,
  wallet: <WalletOutlined />,
  system: <SettingOutlined />,
};

const typeColor: Record<MockNotification['type'], string> = {
  shipment: 'bg-blue-100 text-blue-600',
  procurement: 'bg-purple-100 text-purple-600',
  exchange: 'bg-green-100 text-green-600',
  delivery: 'bg-orange-100 text-orange-600',
  wallet: 'bg-amber-100 text-amber-600',
  system: 'bg-slate-100 text-slate-600',
};

const groupByDate = (notifications: MockNotification[]) => {
  const groups: Record<string, MockNotification[]> = {};
  notifications.forEach((n) => {
    const key = formatDate(n.createdAt);
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  return groups;
};

export const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount, loading } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (notifications.length === 0) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, notifications.length]);

  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
                      onClick={() => !notif.isRead && dispatch(markAsRead(notif.id))}
                      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                        notif.isRead
                          ? 'bg-white border-slate-100 hover:bg-slate-50'
                          : 'bg-brand-blue-light border-brand-blue/20 border-l-4 border-l-brand-blue hover:bg-blue-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeColor[notif.type]}`}>
                        {typeIcon[notif.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`m-0 ${notif.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-slate-500 m-0 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-400 m-0 mt-2">{formatRelativeTime(notif.createdAt)}</p>
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
