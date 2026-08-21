import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import shipmentReducer from './slices/shipmentSlice';
import procurementReducer from './slices/procurementSlice';
import exchangeReducer from './slices/exchangeSlice';
import deliveryReducer from './slices/deliverySlice';
import walletReducer from './slices/walletSlice';
import notificationReducer from './slices/notificationSlice';
import adminReducer from './slices/adminSlice';
import supportReducer from './slices/supportSlice';
import facilityReducer from './slices/facilitySlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shipments: shipmentReducer,
    procurement: procurementReducer,
    exchange: exchangeReducer,
    delivery: deliveryReducer,
    wallet: walletReducer,
    notifications: notificationReducer,
    admin: adminReducer,
    support: supportReducer,
    facilities: facilityReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
