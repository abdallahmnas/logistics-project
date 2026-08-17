import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axios';
import type { User } from '../../types/auth.types';
import type { Package, Batch } from '../../types/shipment.types';
import type { ExchangeRate } from '../../types/exchange.types';
import { scanPackage, createBatch, updatePackageStatus, createInboundPackage } from './shipmentSlice';

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
  const res = await apiClient.get('/admin/stats');
  const d = res.data.data;
  return {
    totalUsers: d.totalUsers || 0,
    totalPackages: d.totalPackages || 0,
    pendingPackages: d.pendingPackages || 0,
    activeBatches: d.activeBatches || 0,
    pendingExchanges: d.pendingExchanges || 0,
    pendingProcurements: d.pendingProcurements || 0,
    totalRevenue: d.totalRevenue || 0,
    monthlyRevenue: d.monthlyRevenue || 0,
  };
});

export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async () => {
  const res = await apiClient.get('/admin/users');
  return res.data.data;
});

export const fetchAllPackages = createAsyncThunk('admin/fetchAllPackages', async () => {
  const res = await apiClient.get('/shipments/packages');
  return res.data.data;
});

export const fetchAllBatches = createAsyncThunk('admin/fetchAllBatches', async () => {
  const res = await apiClient.get('/shipments/batches');
  return res.data.data;
});

export const updateExchangeRate = createAsyncThunk(
  'admin/updateRate',
  async (rate: { platformRate: number; buyRate: number; sellRate: number }) => {
    const res = await apiClient.post('/exchanges/rate', rate);
    return res.data.data;
  }
);

export const createStaffMember = createAsyncThunk(
  'admin/createStaffMember',
  async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    password?: string;
  }) => {
    const res = await apiClient.post('/admin/staff', payload);
    return res.data.data;
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, data }: { userId: string; data: Partial<User> }) => {
    const res = await apiClient.patch(`/admin/users/${userId}`, data);
    return res.data.data;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId: string) => {
    await apiClient.delete(`/admin/users/${userId}`);
    return userId;
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
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(createStaffMember.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
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
            ...(action.payload.photos ? { photos: action.payload.photos } : {}),
          };
        }
      })
      .addCase(createInboundPackage.fulfilled, (state, action) => {
        state.allPackages.unshift(action.payload);
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.allBatches.unshift(action.payload);
        state.allPackages = state.allPackages.map((pkg) =>
          action.payload.packageIds?.includes(pkg.id)
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
