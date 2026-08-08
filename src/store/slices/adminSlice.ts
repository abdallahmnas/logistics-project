import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockUsers, mockPackages, mockBatches, mockExchangeRate } from '../../api/mockData';
import type { User } from '../../types/auth.types';
import type { Package, Batch } from '../../types/shipment.types';
import type { ExchangeRate } from '../../types/exchange.types';
import { scanPackage, createBatch, updatePackageStatus, createInboundPackage } from './shipmentSlice';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface AdminStats {
  totalUsers: number;
  totalPackages: number;
  pendingPackages: number;
  activeBatches: number;
  pendingExchanges: number;
  pendingProcurements: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface AdminState {
  stats: AdminStats | null;
  users: User[];
  allPackages: Package[];
  allBatches: Batch[];
  currentRate: ExchangeRate | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  stats: null,
  users: [],
  allPackages: [],
  allBatches: [],
  currentRate: null,
  loading: false,
  error: null,
};

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async () => {
  await delay(600);
  return {
    totalUsers: 1247,
    totalPackages: 8934,
    pendingPackages: 156,
    activeBatches: 12,
    pendingExchanges: 23,
    pendingProcurements: 18,
    totalRevenue: 485000000,
    monthlyRevenue: 42500000,
  };
});

export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async () => {
  await delay(500);
  return mockUsers;
});

export const fetchAllPackages = createAsyncThunk('admin/fetchAllPackages', async () => {
  await delay(500);
  return mockPackages;
});

export const fetchAllBatches = createAsyncThunk('admin/fetchAllBatches', async () => {
  await delay(400);
  return mockBatches;
});

export const updateExchangeRate = createAsyncThunk(
  'admin/updateRate',
  async (rate: { platformRate: number; buyRate: number; sellRate: number }) => {
    await delay(500);
    return {
      ...mockExchangeRate,
      ...rate,
      effectiveFrom: new Date().toISOString(),
    };
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(fetchAllPackages.fulfilled, (state, action) => {
        state.allPackages = action.payload;
      })
      .addCase(fetchAllBatches.fulfilled, (state, action) => {
        state.allBatches = action.payload;
      })
      .addCase(updateExchangeRate.fulfilled, (state, action) => {
        state.currentRate = action.payload;
      })
      .addCase(scanPackage.fulfilled, (state, action) => {
        const idx = state.allPackages.findIndex((p) => p.id === action.payload.packageId);
        if (idx !== -1) {
          state.allPackages[idx] = {
            ...state.allPackages[idx],
            weightKg: action.payload.weightKg,
            cbm: action.payload.cbm,
            dimensions: action.payload.dimensions,
            status: 'received_cn',
            receivedDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(action.payload.description ? { description: action.payload.description } : {}),
            ...(action.payload.customerId ? { customerId: action.payload.customerId } : {}),
            ...(action.payload.customerName ? { customerName: action.payload.customerName } : {}),
          };
        }
      })
      .addCase(createInboundPackage.fulfilled, (state, action) => {
        state.allPackages.unshift(action.payload);
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.allBatches.unshift(action.payload);
        state.allPackages = state.allPackages.map((pkg) =>
          action.payload.packageIds.includes(pkg.id)
            ? { ...pkg, status: 'consolidating', linkedBatchId: action.payload.id, updatedAt: new Date().toISOString() }
            : pkg
        );
      })
      .addCase(updatePackageStatus.fulfilled, (state, action) => {
        const idx = state.allPackages.findIndex((p) => p.id === action.payload.packageId);
        if (idx !== -1) {
          state.allPackages[idx] = {
            ...state.allPackages[idx],
            status: action.payload.status,
            updatedAt: new Date().toISOString(),
          };
        }
      });
  },
});

export default adminSlice.reducer;
