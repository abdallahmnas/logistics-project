import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, RegisterPayload } from '../../types/auth.types';
import { mockUsers } from '../../api/mockData';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Simulated API delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    await delay(800);
    const user = mockUsers.find((u) => u.email === credentials.email);
    
    if (!user || credentials.password.length < 6) {
      return rejectWithValue('Invalid email or password');
    }

    return {
      user: { ...user, email: credentials.email },
      token: 'mock-jwt-token-' + Date.now(),
    };
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    await delay(1000);
    if (payload.email === 'exists@example.com') {
      return rejectWithValue('Email already registered');
    }

    const newUser = {
      ...mockUsers[0],
      id: 'usr-' + Date.now(),
      customerId: 'HZ-' + Date.now(),
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
    };

    return {
      user: newUser,
      token: 'mock-jwt-token-' + Date.now(),
    };
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await delay(300);
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
