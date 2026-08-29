import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ProcurementState, ProcurementSubmitPayload, ProcurementQuotePayload } from '../../types/procurement.types';
import apiClient from '../../api/axios';

const initialState: ProcurementState = {
  requests: [],
  selectedRequest: null,
  loading: false,
  error: null,
};

export const fetchProcurements = createAsyncThunk('procurement/fetchAll', async () => {
  const res = await apiClient.get('/procurements');
  return res.data.data;
});

export const submitProcurement = createAsyncThunk(
  'procurement/submit',
  async (payload: ProcurementSubmitPayload | FormData) => {
    const isFormData = payload instanceof FormData;
    const res = await apiClient.post('/procurements', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return res.data.data;
  }
);

export const quoteProcurement = createAsyncThunk(
  'procurement/quote',
  async (payload: ProcurementQuotePayload) => {
    const res = await apiClient.post(`/procurements/${payload.requestId}/quote`, payload);
    return { requestId: payload.requestId, ...res.data.data };
  }
);

export const approveProcurement = createAsyncThunk(
  'procurement/approve',
  async (requestId: string) => {
    const res = await apiClient.post(`/procurements/${requestId}/approve`);
    return res.data.data;
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
      .addCase(approveProcurement.fulfilled, (state, action) => {
        const idx = state.requests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.requests[idx] = action.payload;
        }
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
