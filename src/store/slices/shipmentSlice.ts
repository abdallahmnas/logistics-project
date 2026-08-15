import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ShipmentState, PreAlertPayload, ConsolidationRequest } from '../../types/shipment.types';
import apiClient from '../../api/axios';

const initialState: ShipmentState = {
  packages: [],
  selectedPackage: null,
  consolidations: [],
  batches: [],
  filters: {},
  loading: false,
  error: null,
};

export const fetchPackages = createAsyncThunk('shipments/fetchPackages', async () => {
  const res = await apiClient.get('/shipments/packages');
  return res.data.data;
});

export const fetchBatches = createAsyncThunk('shipments/fetchBatches', async () => {
  const res = await apiClient.get('/shipments/batches');
  return res.data.data;
});

export const fetchConsolidations = createAsyncThunk('shipments/fetchConsolidations', async () => {
  const res = await apiClient.get('/shipments/consolidations');
  return res.data.data;
});

export const createPreAlert = createAsyncThunk(
  'shipments/createPreAlert',
  async (payload: PreAlertPayload) => {
    const res = await apiClient.post('/shipments/pre-alert', payload);
    return res.data.data;
  }
);

export const submitConsolidation = createAsyncThunk(
  'shipments/submitConsolidation',
  async (request: ConsolidationRequest) => {
    const res = await apiClient.post('/shipments/consolidate', request);
    return res.data.data;
  }
);

export interface ScanPackagePayload {
  packageId: string;
  weightKg: number;
  length: number;
  width: number;
  height: number;
  description?: string;
  customerId?: string;
  customerName?: string;
  photos?: string[];
}

export const scanPackage = createAsyncThunk(
  'shipments/scanPackage',
  async (payload: ScanPackagePayload) => {
    const res = await apiClient.patch(`/shipments/packages/${payload.packageId}/scan`, payload);
    const updatedPkg = res.data?.data;
    return {
      packageId: payload.packageId,
      weightKg: updatedPkg?.weightKg ?? payload.weightKg,
      cbm: updatedPkg?.cbm ?? (payload.length * payload.width * payload.height) / 1000000,
      dimensions: updatedPkg?.dimensions ?? {
        length: payload.length,
        width: payload.width,
        height: payload.height,
      },
      description: updatedPkg?.description ?? payload.description,
      customerId: updatedPkg?.customerId ?? payload.customerId,
      customerName: updatedPkg?.customerName ?? payload.customerName,
      photos: updatedPkg?.photos ?? payload.photos ?? [],
    };
  }
);

export interface CreateInboundPackagePayload {
  trackingId: string;
  chineseTrackingNo?: string;
  customerId: string;
  customerName: string;
  description: string;
  weightKg: number;
  length: number;
  width: number;
  height: number;
}

export const createInboundPackage = createAsyncThunk(
  'shipments/createInboundPackage',
  async (payload: CreateInboundPackagePayload) => {
    const res = await apiClient.post('/shipments/packages/admin', payload);
    return res.data.data;
  }
);

export interface CreateBatchPayload {
  masterTrackingId: string;
  carrierName: string;
  flightVoyageNo: string;
  containerNo?: string;
  shippingType: 'air' | 'sea';
  packageIds: string[];
}

export const createBatch = createAsyncThunk(
  'shipments/createBatch',
  async (payload: CreateBatchPayload) => {
    const res = await apiClient.post('/shipments/batches', payload);
    return res.data.data;
  }
);

export interface AddPackagesToBatchPayload {
  batchId: string;
  packageIds: string[];
}

export const addPackagesToBatch = createAsyncThunk(
  'shipments/addPackagesToBatch',
  async (payload: AddPackagesToBatchPayload) => {
    const res = await apiClient.patch(`/shipments/batches/${payload.batchId}/packages`, {
      packageIds: payload.packageIds,
    });
    return res.data.data;
  }
);

export interface UpdatePackageStatusPayload {
  packageId: string;
  status: import('../../types/shipment.types').ShipmentStatus;
}

export const updatePackageStatus = createAsyncThunk(
  'shipments/updatePackageStatus',
  async (payload: UpdatePackageStatusPayload) => {
    const res = await apiClient.patch(`/shipments/packages/${payload.packageId}/status`, { status: payload.status });
    return res.data.data;
  }
);

const shipmentSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    setSelectedPackage: (state, action) => {
      state.selectedPackage = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => { state.loading = true; })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch packages';
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.batches = action.payload;
      })
      .addCase(createPreAlert.fulfilled, (state, action) => {
        state.packages.unshift(action.payload);
      })
      .addCase(submitConsolidation.fulfilled, (state, action) => {
        state.consolidations.push(action.payload);
        state.packages = state.packages.map((pkg) =>
          action.payload.packageIds?.includes(pkg.id) ? { ...pkg, status: 'under_packing' } : pkg
        );
      })
      .addCase(fetchConsolidations.fulfilled, (state, action) => {
        state.consolidations = action.payload;
      })
      .addCase(scanPackage.fulfilled, (state, action) => {
        const idx = state.packages.findIndex((p) => p.id === action.payload.packageId);
        if (idx !== -1) {
          state.packages[idx] = {
            ...state.packages[idx],
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
        state.packages.unshift(action.payload);
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.batches.unshift(action.payload);
        state.packages = state.packages.map((pkg) =>
          action.payload.packageIds?.includes(pkg.id)
            ? { ...pkg, status: 'consolidating', linkedBatchId: action.payload.id, updatedAt: new Date().toISOString() }
            : pkg
        );
      })
      .addCase(addPackagesToBatch.fulfilled, (state, action) => {
        const batch = state.batches.find((b) => b.id === action.payload.id);
        if (batch) {
          batch.packageIds = action.payload.packageIds || [];
          batch.packageCount = batch.packageIds.length;
        }
        state.packages = state.packages.map((pkg) =>
          action.payload.packageIds?.includes(pkg.id)
            ? { ...pkg, status: 'consolidating', linkedBatchId: action.payload.id, updatedAt: new Date().toISOString() }
            : pkg
        );
      })
      .addCase(updatePackageStatus.fulfilled, (state, action) => {
        const idx = state.packages.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) {
          state.packages[idx] = action.payload;
        }
      });
  },
});

export const { setSelectedPackage, setFilters, clearFilters } = shipmentSlice.actions;
export default shipmentSlice.reducer;
