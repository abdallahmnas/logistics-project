import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Banner, BannerState } from '../../types/banner.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const initialState: BannerState = {
  activeBanners: [],
  adminBanners: [],
  loading: false,
  error: null,
};

export const fetchActiveBanners = createAsyncThunk(
  'banners/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banners`);
      return response.data.data as Banner[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch active banners');
    }
  }
);

export const fetchAdminBanners = createAsyncThunk(
  'banners/fetchAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banners/admin`, {
        headers: getAuthHeader(),
      });
      return response.data.data as Banner[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin banners');
    }
  }
);

export const createBanner = createAsyncThunk(
  'banners/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/banners`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data as Banner;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create banner');
    }
  }
);

export const updateBanner = createAsyncThunk(
  'banners/update',
  async ({ id, formData }: { id: string; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/banners/${id}`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data as Banner;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update banner');
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'banners/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/banners/${id}`, {
        headers: getAuthHeader(),
      });
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete banner');
    }
  }
);

const bannerSlice = createSlice({
  name: 'banners',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Active Banners
      .addCase(fetchActiveBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.activeBanners = action.payload;
      })
      .addCase(fetchActiveBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Admin Banners
      .addCase(fetchAdminBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBanners = action.payload;
      })
      .addCase(fetchAdminBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Banner
      .addCase(createBanner.fulfilled, (state, action) => {
        state.adminBanners.unshift(action.payload);
        if (action.payload.isActive) state.activeBanners.unshift(action.payload);
      })
      // Update Banner
      .addCase(updateBanner.fulfilled, (state, action) => {
        const index = state.adminBanners.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) state.adminBanners[index] = action.payload;

        const activeIndex = state.activeBanners.findIndex((b) => b.id === action.payload.id);
        if (action.payload.isActive) {
          if (activeIndex !== -1) state.activeBanners[activeIndex] = action.payload;
          else state.activeBanners.push(action.payload);
        } else if (activeIndex !== -1) {
          state.activeBanners.splice(activeIndex, 1);
        }
      })
      // Delete Banner
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.adminBanners = state.adminBanners.filter((b) => b.id !== action.payload);
        state.activeBanners = state.activeBanners.filter((b) => b.id !== action.payload);
      });
  },
});

export default bannerSlice.reducer;
