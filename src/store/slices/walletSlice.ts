import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WalletState } from '../../types/wallet.types';
import apiClient from '../../api/axios';

const initialState: WalletState = {
  wallet: null,
  transactions: [],
  loading: false,
  error: null,
};

export const fetchWallet = createAsyncThunk('wallet/fetch', async () => {
  const res = await apiClient.get('/wallet');
  const data = res.data.data;
  return {
    ...data,
    balance: Number(data.balance),
    escrowHeld: Number(data.escrowHeld || 0),
    availableBalance: Number(data.availableBalance || data.balance),
  };
});

export const fetchTransactions = createAsyncThunk('wallet/fetchTransactions', async () => {
  const res = await apiClient.get('/wallet/transactions');
  return res.data.data;
});

export const topUpWallet = createAsyncThunk(
  'wallet/topUp',
  async (payload: { amount: number; paymentMethod: string }) => {
    const res = await apiClient.post('/wallet/top-up', payload);
    const data = res.data.data;
    return {
      ...data,
      balance: Number(data.balance),
      escrowHeld: Number(data.escrowHeld || 0),
      availableBalance: Number(data.availableBalance || data.balance),
    };
  }
);

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
      })
      .addCase(topUpWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
      });
  },
});

export default walletSlice.reducer;
