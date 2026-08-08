import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ShipmentState, PreAlertPayload, ConsolidationRequest } from '../../types/shipment.types';
import { mockPackages, mockBatches, mockConsolidations } from '../../api/mockData';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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
  await delay(600);
  return mockPackages;
});

export const fetchBatches = createAsyncThunk('shipments/fetchBatches', async () => {
  await delay(400);
  return mockBatches;
});

export const fetchConsolidations = createAsyncThunk('shipments/fetchConsolidations', async () => {
  await delay(500);
  return mockConsolidations;
});

export const createPreAlert = createAsyncThunk(
  'shipments/createPreAlert',
  async (payload: PreAlertPayload) => {
    await delay(800);
    return {
      id: 'pkg-' + Date.now(),
      trackingId: 'HZ-AIR-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 999),
      chineseTrackingNo: payload.chineseTrackingNo,
      customerId: 'usr-001',
      customerName: 'Adebayo Okonkwo',
      status: 'pre_alerted' as const,
      description: payload.description,
      weightKg: 0,
      cbm: 0,
      photos: payload.photos || [],
      paymentStatus: 'unpaid' as const,
      preAlertDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export const submitConsolidation = createAsyncThunk(
  'shipments/submitConsolidation',
  async (request: ConsolidationRequest) => {
    await delay(1000);
    const now = new Date().toISOString();
    return {
      id: 'cons-' + Date.now(),
      consolidationId: 'CON-' + Math.floor(Math.random() * 99999),
      customerId: 'usr-001',
      customerName: 'Adebayo Okonkwo',
      packageIds: request.packageIds,
      shippingMethod: request.shippingMethod,
      destinationWarehouse: request.destinationWarehouse,
      paymentMethod: request.paymentMethod,
      totalWeightKg: 0,
      totalCbm: 0,
      shippingFee: 0,
      status: 'pending_packing' as const,
      createdAt: now,
      updatedAt: now,
    };
  }
);

// ─── Admin Thunks ─────────────────────────────────────────

export interface ScanPackagePayload {
  packageId: string;
  weightKg: number;
  length: number;
  width: number;
  height: number;
  description?: string;
  customerId?: string;
  customerName?: string;
}

export const scanPackage = createAsyncThunk(
  'shipments/scanPackage',
  async (payload: ScanPackagePayload) => {
    await delay(700);
    const cbm = (payload.length * payload.width * payload.height) / 1000000;
    return {
      packageId: payload.packageId,
      weightKg: payload.weightKg,
      cbm,
      dimensions: {
        length: payload.length,
        width: payload.width,
        height: payload.height,
      },
      description: payload.description,
      customerId: payload.customerId,
      customerName: payload.customerName,
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
    await delay(800);
    const cbm = (payload.length * payload.width * payload.height) / 1000000;
    const now = new Date().toISOString();
    return {
      id: 'pkg-' + Date.now(),
      trackingId: payload.trackingId,
      chineseTrackingNo: payload.chineseTrackingNo || '—',
      customerId: payload.customerId,
      customerName: payload.customerName,
      status: 'received_cn' as const,
      description: payload.description,
      weightKg: payload.weightKg,
      cbm,
      dimensions: { length: payload.length, width: payload.width, height: payload.height },
      paymentStatus: 'unpaid' as const,
      preAlertDate: now,
      receivedDate: now,
      createdAt: now,
      updatedAt: now,
    };
  }
);

export interface CreateBatchPayload {
  masterTrackingId: string;
  carrierName: string;
  flightVoyageNo: string;
  containerNo?: string;
  shippingType: 'air' | 'sea';
  packageIds: string[]; // This is actually consolidationIds now but keeping payload name for simplicity, or we can just use consolidationIds
}

export const createBatch = createAsyncThunk(
  'shipments/createBatch',
  async (payload: CreateBatchPayload) => {
    await delay(900);
    return {
      id: 'batch-' + Date.now(),
      masterTrackingId: payload.masterTrackingId,
      carrierName: payload.carrierName,
      flightVoyageNo: payload.flightVoyageNo,
      containerNo: payload.containerNo,
      shippingType: payload.shippingType,
      status: 'consolidating' as const,
      consolidationIds: payload.packageIds,
      consolidationCount: payload.packageIds.length,
      totalWeightKg: 0,
      totalCbm: 0,
      departureDate: undefined,
      expectedArrivalDate: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export interface AddPackagesToBatchPayload {
  batchId: string;
  packageIds: string[];
}

export const addPackagesToBatch = createAsyncThunk(
  'shipments/addPackagesToBatch',
  async (payload: AddPackagesToBatchPayload) => {
    await delay(500);
    return payload;
  }
);

export interface UpdatePackageStatusPayload {
  packageId: string;
  status: import('../../types/shipment.types').ShipmentStatus;
}

export const updatePackageStatus = createAsyncThunk(
  'shipments/updatePackageStatus',
  async (payload: UpdatePackageStatusPayload) => {
    await delay(500);
    return payload;
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
          action.payload.packageIds.includes(pkg.id) ? { ...pkg, status: 'under_packing' } : pkg
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
          action.payload.packageIds.includes(pkg.id)
            ? { ...pkg, status: 'consolidating', linkedBatchId: action.payload.id, updatedAt: new Date().toISOString() }
            : pkg
        );
      })
      .addCase(addPackagesToBatch.fulfilled, (state, action) => {
        const batch = state.batches.find((b) => b.id === action.payload.batchId);
        if (batch) {
          batch.consolidationIds = [...new Set([...(batch.consolidationIds || []), ...action.payload.packageIds])];
          batch.consolidationCount = batch.consolidationIds.length;
        }
        state.consolidations = state.consolidations.map((c) =>
          action.payload.packageIds.includes(c.id)
            ? { ...c, status: 'batched', updatedAt: new Date().toISOString() }
            : c
        );
      })
      .addCase(updatePackageStatus.fulfilled, (state, action) => {
        const idx = state.packages.findIndex((p) => p.id === action.payload.packageId);
        if (idx !== -1) {
          state.packages[idx] = {
            ...state.packages[idx],
            status: action.payload.status,
            updatedAt: new Date().toISOString(),
          };
        }
      });
  },
});

export const { setSelectedPackage, setFilters, clearFilters } = shipmentSlice.actions;
export default shipmentSlice.reducer;
