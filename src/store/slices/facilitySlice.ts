import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export interface Facility {
  id: string;
  code: string;
  name: string;
  location: string;
  country: 'CN' | 'NG' | string;
  type: 'regional_hub' | 'dist_center' | 'fulfillment' | 'cross_dock';
  status: 'active' | 'at_capacity' | 'inactive';
  capacityUtilization: number;
  currentVolume: string;
  maxVolume: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FacilityState {
  facilities: Facility[];
  loading: boolean;
  error: string | null;
}

const initialState: FacilityState = {
  facilities: [],
  loading: false,
  error: null,
};

export const fetchFacilities = createAsyncThunk('facilities/fetchFacilities', async () => {
  const response = await apiClient.get('/facilities');
  return response.data.data;
});

export const createFacility = createAsyncThunk('facilities/createFacility', async (payload: Partial<Facility>) => {
  const response = await apiClient.post('/facilities', payload);
  return response.data.data;
});

export const updateFacility = createAsyncThunk(
  'facilities/updateFacility',
  async ({ id, payload }: { id: string; payload: Partial<Facility> }) => {
    const response = await apiClient.put(`/facilities/${id}`, payload);
    return response.data.data;
  }
);

export const deleteFacility = createAsyncThunk('facilities/deleteFacility', async (id: string) => {
  await apiClient.delete(`/facilities/${id}`);
  return id;
});

const facilitySlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = action.payload;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch facilities';
      })
      // Create
      .addCase(createFacility.fulfilled, (state, action) => {
        state.facilities.push(action.payload);
      })
      // Update
      .addCase(updateFacility.fulfilled, (state, action) => {
        const index = state.facilities.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.facilities[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.facilities = state.facilities.filter((f) => f.id !== action.payload);
      });
  },
});

export default facilitySlice.reducer;
