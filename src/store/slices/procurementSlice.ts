import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ProcurementState, ProcurementSubmitPayload, ProcurementQuotePayload } from '../../types/procurement.types';
import { mockProcurements } from '../../api/mockData';
import { DEFAULT_EXCHANGE_RATE } from '../../utils/constants';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const initialState: ProcurementState = {
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null,
};

export const fetchProcurements = createAsyncThunk('procurement/fetchAll', async () => {
  await delay(600);
  return mockProcurements;
});

export const submitProcurement = createAsyncThunk(
  'procurement/submit',
  async (payload: ProcurementSubmitPayload) => {
    await delay(800);
    return {
      id: 'proc-' + Date.now(),
      customerId: 'usr-001',
      customerName: 'Adebayo Okonkwo',
      productUrl: payload.productUrl,
      productPhotos: payload.productPhotos,
      quantity: payload.quantity,
      specifications: payload.specifications,
      sizes: payload.sizes,
      colors: payload.colors,
      variations: payload.variations,
      notes: payload.notes,
      status: 'submitted' as const,
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export const quoteProcurement = createAsyncThunk(
  'procurement/quote',
  async (payload: ProcurementQuotePayload) => {
    await delay(700);
    const totalCostRmb = payload.productCostRmb + payload.serviceFeeRmb;
    const exchangeRateUsed = DEFAULT_EXCHANGE_RATE.platformRate;
    const totalCostNaira = totalCostRmb * exchangeRateUsed;
    return {
      requestId: payload.requestId,
      productCostRmb: payload.productCostRmb,
      serviceFeeRmb: payload.serviceFeeRmb,
      supplierName: payload.supplierName,
      totalCostRmb,
      exchangeRateUsed,
      totalCostNaira,
      quotedAt: new Date().toISOString(),
    };
  }
);

const procurementSlice = createSlice({
  name: 'procurement',
  initialState,
  reducers: {
    setSelectedRequest: (state, action) => {
      state.selectedRequest = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProcurements.pending, (state) => { state.loading = true; })
      .addCase(fetchProcurements.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchProcurements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
      })
      .addCase(submitProcurement.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      })
      .addCase(quoteProcurement.fulfilled, (state, action) => {
        const idx = state.requests.findIndex((r) => r.id === action.payload.requestId);
        if (idx !== -1) {
          state.requests[idx] = {
            ...state.requests[idx],
            status: 'quoted',
            productCostRmb: action.payload.productCostRmb,
            serviceFeeRmb: action.payload.serviceFeeRmb,
            supplierName: action.payload.supplierName,
            totalCostRmb: action.payload.totalCostRmb,
            exchangeRateUsed: action.payload.exchangeRateUsed,
            totalCostNaira: action.payload.totalCostNaira,
            quotedAt: action.payload.quotedAt,
            updatedAt: new Date().toISOString(),
          };
        }
      });
  },
});

export const { setSelectedRequest } = procurementSlice.actions;
export default procurementSlice.reducer;
