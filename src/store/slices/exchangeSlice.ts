import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ExchangeState, ExchangeRequestPayload } from '../../types/exchange.types';
import apiClient from '../../api/axios';

const initialState: ExchangeState = {
  exchanges: [],
  selectedExchange: null,
  activeRate: null,
  loading: false,
  error: null,
};

export const fetchExchanges = createAsyncThunk('exchange/fetchAll', async () => {
  const res = await apiClient.get('/exchanges');
  return res.data.data;
});

export const fetchActiveRate = createAsyncThunk('exchange/fetchRate', async () => {
  const res = await apiClient.get('/exchanges/rate');
  return res.data.data;
});

export const submitExchangeRequest = createAsyncThunk(
  'exchange/submit',
  async (payload: ExchangeRequestPayload) => {
    const res = await apiClient.post('/exchanges', payload);
    return res.data.data;
  }
);

export const verifyExchangePayment = createAsyncThunk(
  'exchange/verifyPayment',
  async (exchangeId: string) => {
    const res = await apiClient.patch(`/exchanges/${exchangeId}/verify-naira`);
    return res.data.data;
  }
);

export const releaseRmb = createAsyncThunk(
  'exchange/releaseRmb',
  async (exchangeId: string) => {
    const res = await apiClient.patch(`/exchanges/${exchangeId}/release-rmb`);
    return res.data.data;
  }
);

const exchangeSlice = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    setSelectedExchange: (state, action) => {
      state.selectedExchange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchanges.pending, (state) => { state.loading = true; })
      .addCase(fetchExchanges.fulfilled, (state, action) => {
        state.loading = false;
        state.exchanges = action.payload;
      })
      .addCase(fetchExchanges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch';
      })
      .addCase(fetchActiveRate.fulfilled, (state, action) => {
        state.activeRate = action.payload;
      })
      .addCase(submitExchangeRequest.fulfilled, (state, action) => {
        state.exchanges.unshift(action.payload);
      })
      .addCase(verifyExchangePayment.fulfilled, (state, action) => {
        const idx = state.exchanges.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.exchanges[idx] = action.payload;
      })
      .addCase(releaseRmb.fulfilled, (state, action) => {
        const idx = state.exchanges.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.exchanges[idx] = action.payload;
      });
  },
});

export const { setSelectedExchange } = exchangeSlice.actions;
export default exchangeSlice.reducer;
