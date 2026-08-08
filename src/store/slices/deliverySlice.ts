import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DeliveryState, LocalDeliveryPayload } from '../../types/delivery.types';
import { mockDeliveries } from '../../api/mockData';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const initialState: DeliveryState = {
  deliveries: [],
  selectedDelivery: null,
  loading: false,
  error: null,
};

export const fetchDeliveries = createAsyncThunk('delivery/fetchAll', async () => {
  await delay(600);
  return mockDeliveries;
});

export const submitDelivery = createAsyncThunk(
  'delivery/submit',
  async (payload: LocalDeliveryPayload) => {
    await delay(800);
    const distanceKm = Math.random() * 30 + 5;
    const rates = { motorbike: { base: 1500, perKm: 150 }, sedan: { base: 3000, perKm: 250 }, box_truck: { base: 8000, perKm: 500 } };
    const r = rates[payload.vehicleType];
    const distanceFee = Math.round(distanceKm * r.perKm);
    return {
      id: 'del-' + Date.now(),
      customerId: 'usr-001',
      customerName: 'Adebayo Okonkwo',
      status: 'pending' as const,
      ...payload,
      packagePhotos: payload.packagePhotos || [],
      distanceKm: Math.round(distanceKm * 10) / 10,
      baseFare: r.base,
      distanceFee,
      totalFee: r.base + distanceFee,
      paymentStatus: 'unpaid' as const,
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export interface AssignDriverPayload {
  deliveryId: string;
  driverName: string;
  driverPhone: string;
}

export const assignDriver = createAsyncThunk(
  'delivery/assignDriver',
  async (payload: AssignDriverPayload) => {
    await delay(600);
    const verificationPin = String(Math.floor(1000 + Math.random() * 9000));
    return {
      deliveryId: payload.deliveryId,
      driverId: 'drv-' + Date.now(),
      driverName: payload.driverName,
      driverPhone: payload.driverPhone,
      verificationPin,
    };
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
      });
  },
});

export const { setSelectedDelivery } = deliverySlice.actions;
export default deliverySlice.reducer;
