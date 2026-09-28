import apiClient from '../api/axios';
import { ClearanceRequest, ClearanceDocument, ClearanceMessage } from '../types/clearance';

export const clearanceService = {
  /**
   * Get all customer clearance requests
   */
  getRequests: async (status?: string, search?: string): Promise<ClearanceRequest[]> => {
    const params: any = {};
    if (status) params.status = status;
    if (search) params.search = search;
    const response = await apiClient.get('/clearance/requests', { params });
    return response.data.data;
  },

  /**
   * Get single clearance request details
   */
  getRequestById: async (id: string): Promise<ClearanceRequest> => {
    const response = await apiClient.get(`/clearance/requests/${id}`);
    return response.data.data;
  },

  /**
   * Create new clearance request (Draft or Submitted)
   */
  createRequest: async (payload: any): Promise<ClearanceRequest> => {
    const response = await apiClient.post('/clearance/requests', payload);
    return response.data.data;
  },

  /**
   * Update existing draft or editable clearance request
   */
  updateRequest: async (id: string, payload: any): Promise<ClearanceRequest> => {
    const response = await apiClient.put(`/clearance/requests/${id}`, payload);
    return response.data.data;
  },

  /**
   * Upload additional document
   */
  uploadDocument: async (id: string, docData: { documentType: string; fileName: string; fileUrl: string }): Promise<ClearanceDocument> => {
    const response = await apiClient.post(`/clearance/requests/${id}/documents`, docData);
    return response.data.data;
  },

  /**
   * Send message on clearance request thread
   */
  sendMessage: async (id: string, message: string, attachmentUrl?: string): Promise<ClearanceMessage> => {
    const response = await apiClient.post(`/clearance/requests/${id}/messages`, { message, attachmentUrl });
    return response.data.data;
  },

  /**
   * Pay pending clearance charges via Wallet
   */
  payCharges: async (id: string): Promise<ClearanceRequest> => {
    const response = await apiClient.post(`/clearance/requests/${id}/pay`);
    return response.data.data;
  },

  /**
   * Cancel clearance request
   */
  cancelRequest: async (id: string, reason?: string): Promise<ClearanceRequest> => {
    const response = await apiClient.post(`/clearance/requests/${id}/cancel`, { reason });
    return response.data.data;
  },
};
