import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axios';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'shipment' | 'procurement' | 'exchange' | 'delivery' | 'wallet' | 'system' | 'support';
  isRead: boolean;
  referenceId?: string;
  createdAt?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async () => {
  const res = await apiClient.get('/notifications');
  return res.data.data;
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
        apiClient.patch(`/notifications/${action.payload}/read`).catch(() => {});
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
      // Fire-and-forget API call
      apiClient.patch('/notifications/read-all').catch(() => {});
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: NotificationItem) => !n.isRead).length;
      });
  },
});

export const { addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
