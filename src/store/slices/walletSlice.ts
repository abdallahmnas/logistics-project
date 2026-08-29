import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { WalletState } from '../../types/wallet.types';
import apiClient from '../../api/axios';

const initialState: WalletState = {
  wallet: null,
  data: null,
  transactions: [],
  deposits: [],
  adminDeposits: [],
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

export const fetchDeposits = createAsyncThunk('wallet/fetchDeposits', async () => {
  const res = await apiClient.get('/wallet/deposits');
  return res.data.data;
});

export const submitDeposit = createAsyncThunk(
  'wallet/submitDeposit',
  async (payload: FormData) => {
    const res = await apiClient.post('/wallet/deposit', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  }
);

export const fetchAdminDeposits = createAsyncThunk(
  'wallet/fetchAdminDeposits',
  async (statusFilter?: string) => {
    const params = statusFilter && statusFilter !== 'all' ? { status: statusFilter } : undefined;
    const res = await apiClient.get('/wallet/admin/deposits', { params });
    return res.data.data;
  }
);

export const approveDepositAdmin = createAsyncThunk(
  'wallet/approveDepositAdmin',
  async (depositId: string) => {
    const res = await apiClient.post(`/wallet/admin/deposits/${depositId}/approve`);
    return res.data.data;
  }
);

export const rejectDepositAdmin = createAsyncThunk(
  'wallet/rejectDepositAdmin',
  async (payload: { depositId: string; rejectionReason: string }) => {
    const res = await apiClient.post(`/wallet/admin/deposits/${payload.depositId}/reject`, {
      rejectionReason: payload.rejectionReason,
    });
    return res.data.data;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.wallet = action.payload;
        state.data = action.payload;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch wallet';
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(fetchDeposits.fulfilled, (state, action) => {
        state.deposits = action.payload;
      })
      .addCase(submitDeposit.fulfilled, (state, action) => {
        state.deposits.unshift(action.payload);
      })
      .addCase(fetchAdminDeposits.fulfilled, (state, action) => {
        state.adminDeposits = action.payload;
      })
      .addCase(approveDepositAdmin.fulfilled, (state, action) => {
        const deposit = action.payload.deposit;
        const idx = state.adminDeposits.findIndex((d) => d.id === deposit.id);
        if (idx !== -1) {
          state.adminDeposits[idx] = deposit;
        }
      })
      .addCase(rejectDepositAdmin.fulfilled, (state, action) => {
        const deposit = action.payload;
        const idx = state.adminDeposits.findIndex((d) => d.id === deposit.id);
        if (idx !== -1) {
          state.adminDeposits[idx] = deposit;
        }
      });
  },
});

export default walletSlice.reducer;
