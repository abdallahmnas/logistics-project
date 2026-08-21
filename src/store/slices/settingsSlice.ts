import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axios';

export interface SystemSettings {
  id: string;
  ngnEscrowBankName: string;
  ngnEscrowAccountNo: string;
  ngnEscrowAccountName: string;
  rmbReceivingBankName: string;
  rmbReceivingAccountNo: string;
  rmbReceivingAccountName: string;
  rmbReceivingAlipay: string;
  rmbReceivingWechat: string;
  cnyExchangeRate: number;
  usdExchangeRate: number;
  airFreightRatePerKg: number;
  seaFreightRatePerCbm: number;
  seaFreightRatePerKg: number;
  buyForMeFeePercent: number;
  buyForMeFixedFee: number;
  deliveryMotorbikeBaseRate: number;
  deliveryMotorbikePerKm: number;
  deliverySedanBaseRate: number;
  deliverySedanPerKm: number;
  deliveryTruckBaseRate: number;
  deliveryTruckPerKm: number;
  walletFundingFeePercent: number;
  walletWithdrawalFlatFee: number;
  customRoutes?: string;
  updatedAt?: string;
}

interface SettingsState {
  settings: SystemSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: null,
  loading: false,
  error: null,
};

export const fetchSettings = createAsyncThunk('settings/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    const res = await apiClient.get('/settings');
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (payload: Partial<SystemSettings>, { rejectWithValue }) => {
    try {
      const res = await apiClient.put('/settings', payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;
