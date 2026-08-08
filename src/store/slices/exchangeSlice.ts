import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ExchangeState, ExchangeRequestPayload } from '../../types/exchange.types';
import { mockExchanges, mockExchangeRate } from '../../api/mockData';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const initialState: ExchangeState = {
  exchanges: [],
  selectedExchange: null,
  activeRate: null,
  loading: false,
  error: null,
};

export const fetchExchanges = createAsyncThunk('exchange/fetchAll', async () => {
  await delay(600);
  return mockExchanges;
});

export const fetchActiveRate = createAsyncThunk('exchange/fetchRate', async () => {
  await delay(300);
  return mockExchangeRate;
});

export const submitExchangeRequest = createAsyncThunk(
  'exchange/submit',
  async (payload: ExchangeRequestPayload) => {
    await delay(800);
    const rate = mockExchangeRate.platformRate;
    const fee = payload.amountNaira * 0.01;
    return {
      id: 'exch-' + Date.now(),
      customerId: 'usr-001',
      customerName: 'Adebayo Okonkwo',
      amountNaira: payload.amountNaira,
      amountRmb: payload.amountNaira / rate,
      exchangeRate: rate,
      platformFee: fee,
      totalNaira: payload.amountNaira + fee,
      status: 'awaiting_payment' as const,
      escrowBankName: 'GTBank',
      escrowAccountNo: '0123456789',
      escrowAccountName: 'Hamza RMB Trading Ltd',
      rmbDestType: payload.rmbDestType,
      rmbDestAccount: payload.rmbDestAccount,
      rmbDestName: payload.rmbDestName,
      rmbDestQrCode: payload.rmbDestQrCode,
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
);

export const verifyExchangePayment = createAsyncThunk(
  'exchange/verifyPayment',
  async (exchangeId: string) => {
    await delay(600);
    return { exchangeId, nairaConfirmedAt: new Date().toISOString() };
  }
);

export const releaseRmb = createAsyncThunk(
  'exchange/releaseRmb',
  async (exchangeId: string) => {
    await delay(600);
    const now = new Date().toISOString();
    return { exchangeId, rmbReleasedAt: now, completedAt: now };
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
        const idx = state.exchanges.findIndex((e) => e.id === action.payload.exchangeId);
        if (idx !== -1) {
          state.exchanges[idx] = {
            ...state.exchanges[idx],
            status: 'naira_confirmed',
            nairaConfirmedAt: action.payload.nairaConfirmedAt,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(releaseRmb.fulfilled, (state, action) => {
        const idx = state.exchanges.findIndex((e) => e.id === action.payload.exchangeId);
        if (idx !== -1) {
          state.exchanges[idx] = {
            ...state.exchanges[idx],
            status: 'completed',
            rmbReleasedAt: action.payload.rmbReleasedAt,
            completedAt: action.payload.completedAt,
            updatedAt: new Date().toISOString(),
          };
        }
      });
  },
});

export const { setSelectedExchange } = exchangeSlice.actions;
export default exchangeSlice.reducer;
