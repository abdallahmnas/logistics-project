import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DeliveryState, LocalDeliveryPayload } from '../../types/delivery.types';
import apiClient from '../../api/axios';

const initialState: DeliveryState = {
  deliveries: [],
  selectedDelivery: null,
  loading: false,
  error: null,
};

export const fetchDeliveries = createAsyncThunk('delivery/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/delivery');
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const submitDelivery = createAsyncThunk(
  'delivery/submit',
  async (payload: LocalDeliveryPayload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/delivery', payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export interface AssignDriverPayload {
  deliveryId: string;
  driverName: string;
  driverPhone: string;
}

export const assignDriver = createAsyncThunk(
  'delivery/assignDriver',
  async (payload: AssignDriverPayload, { rejectWithValue }) => {
    try {
      const res = await apiClient.post(`/delivery/${payload.deliveryId}/driver`, payload);
      return { deliveryId: payload.deliveryId, ...res.data.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateStatus',
  async (payload: { deliveryId: string; status: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/delivery/${payload.deliveryId}/status`, { status: payload.status });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setSelectedDelivery: (state, action) => {
      state.selectedDelivery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => { state.loading = true; })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.loading = false;
        state.deliveries = action.payload;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
      })
      .addCase(submitDelivery.fulfilled, (state, action) => {
        state.deliveries.unshift(action.payload);
      })
      .addCase(assignDriver.fulfilled, (state, action) => {
        const idx = state.deliveries.findIndex((d) => d.id === action.payload.deliveryId);
        if (idx !== -1) {
          state.deliveries[idx] = {
            ...state.deliveries[idx],
            status: 'driver_assigned',
            driverId: action.payload.driverId,
            driverName: action.payload.driverName,
            driverPhone: action.payload.driverPhone,
            verificationPin: action.payload.verificationPin,
            confirmedAt: state.deliveries[idx].confirmedAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const idx = state.deliveries.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.deliveries[idx] = action.payload;
      });
  },
});

export const { setSelectedDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;
