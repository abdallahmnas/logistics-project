import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockNotifications, type MockNotification } from '../../api/mockData';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface NotificationState {
  notifications: MockNotification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async () => {
  await delay(400);
  return mockNotifications;
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      });
  },
});

export const { markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;
