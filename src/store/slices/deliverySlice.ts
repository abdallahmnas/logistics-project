import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DeliveryState, LocalDeliveryPayload } from '../../types/delivery.types';
import apiClient from '../../api/axios';

const initialState: DeliveryState = {
  deliveries: [],
  vehicles: [],
  adminVehicles: [],
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
  async (payload: { deliveryId: string; status: string; notes?: string; driverName?: string; driverPhone?: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.patch(`/delivery/${payload.deliveryId}/status`, {
        status: payload.status,
        notes: payload.notes,
        driverName: payload.driverName,
        driverPhone: payload.driverPhone,
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Delivery Vehicle CRUD Thunks
export const fetchVehicles = createAsyncThunk('delivery/fetchVehicles', async () => {
  const res = await apiClient.get('/delivery/vehicles');
  return res.data.data;
});

export const fetchAdminVehicles = createAsyncThunk('delivery/fetchAdminVehicles', async () => {
  const res = await apiClient.get('/delivery/admin/vehicles');
  return res.data.data;
});

export const createVehicle = createAsyncThunk(
  'delivery/createVehicle',
  async (payload: FormData, { rejectWithValue }) => {
    try {
      const res = await apiClient.post('/delivery/admin/vehicles', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'delivery/updateVehicle',
  async (payload: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/delivery/admin/vehicles/${payload.id}`, payload.formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'delivery/deleteVehicle',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/delivery/admin/vehicles/${id}`);
      return id;
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
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload;
      })
      .addCase(fetchAdminVehicles.fulfilled, (state, action) => {
        state.adminVehicles = action.payload;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.adminVehicles.unshift(action.payload);
        if (action.payload.isActive) state.vehicles.push(action.payload);
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const idx = state.adminVehicles.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.adminVehicles[idx] = action.payload;

        const vIdx = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (action.payload.isActive) {
          if (vIdx !== -1) state.vehicles[vIdx] = action.payload;
          else state.vehicles.push(action.payload);
        } else {
          if (vIdx !== -1) state.vehicles.splice(vIdx, 1);
        }
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.adminVehicles = state.adminVehicles.filter((v) => v.id !== action.payload);
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
      });
  },
});

export const { setSelectedDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;
