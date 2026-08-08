import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WalletState } from '../../types/wallet.types';
import { mockWallet, mockTransactions } from '../../api/mockData';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk('wallet/fetch', async () => {
  await delay(500);
  return mockWallet;
});

export const fetchTransactions = createAsyncThunk('wallet/fetchTransactions', async () => {
  await delay(500);
  return mockTransactions;
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => { state.loading = true; })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wallet';
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      });
  },
});

export default walletSlice.reducer;
