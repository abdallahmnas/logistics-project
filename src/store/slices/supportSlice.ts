import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/axios';

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  attachments?: string[];
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  category: 'shipment' | 'payment' | 'exchange' | 'procurement' | 'delivery' | 'account' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  referenceId?: string;
  messages?: TicketMessage[];
  createdAt?: string;
  updatedAt?: string;
}

interface SupportState {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
};

export const fetchTickets = createAsyncThunk('support/fetchAll', async () => {
  const res = await apiClient.get('/support');
  return res.data.data;
});

export const fetchTicket = createAsyncThunk('support/fetchOne', async (id: string) => {
  const res = await apiClient.get(`/support/${id}`);
  return res.data.data;
});

export const createTicket = createAsyncThunk('support/create', async (payload: {
  subject: string;
  message: string;
  category?: string;
  priority?: string;
  referenceId?: string;
}) => {
  const res = await apiClient.post('/support', payload);
  return res.data.data;
});

export const replyToTicket = createAsyncThunk('support/reply', async (payload: {
  ticketId: string;
  message: string;
}) => {
  const res = await apiClient.post(`/support/${payload.ticketId}/reply`, { message: payload.message });
  return res.data.data;
});

export const updateTicketStatus = createAsyncThunk('support/updateStatus', async (payload: {
  ticketId: string;
  status: string;
}) => {
  const res = await apiClient.patch(`/support/${payload.ticketId}/status`, { status: payload.status });
  return res.data.data;
});

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    setSelectedTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => { state.loading = true; })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tickets';
      })
      .addCase(fetchTicket.fulfilled, (state, action) => {
        state.selectedTicket = action.payload;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.tickets.unshift(action.payload);
        state.selectedTicket = action.payload;
      })
      .addCase(replyToTicket.fulfilled, (state, action) => {
        state.selectedTicket = action.payload;
        const idx = state.tickets.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tickets[idx] = action.payload;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const idx = state.tickets.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tickets[idx] = action.payload;
        if (state.selectedTicket?.id === action.payload.id) state.selectedTicket = action.payload;
      });
  },
});

export const { setSelectedTicket } = supportSlice.actions;
export default supportSlice.reducer;
