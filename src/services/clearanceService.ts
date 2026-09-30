import apiClient from '../api/axios';
import type {
  ClearanceRequest,
  ClearanceDocument,
  ClearanceMessage,
  ClearanceStatus,
} from '../types/clearance';

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
   * Get all clearance requests across all customers (Admin & Clearance Agents)
   */
  getAllAdminRequests: async (params?: {
    status?: string;
    search?: string;
    shipmentType?: string;
  }): Promise<ClearanceRequest[]> => {
    const response = await apiClient.get('/clearance/admin/all', { params });
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
   * Modify clearance request status (Admin & Clearance Agents)
   */
  updateStatus: async (
    id: string,
    status: ClearanceStatus,
    note?: string,
    requiredActionNote?: string
  ): Promise<ClearanceRequest> => {
    const response = await apiClient.patch(`/clearance/requests/${id}/status`, {
      status,
      note,
      requiredActionNote,
    });
    return response.data.data;
  },

  /**
   * Add charge to clearance request (Admin & Clearance Agents)
   */
  addCharge: async (
    id: string,
    chargeData: {
      category: string;
      description: string;
      amount: number;
      currency?: string;
    }
  ): Promise<any> => {
    const response = await apiClient.post(`/clearance/requests/${id}/charges`, chargeData);
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
  uploadDocument: async (
    id: string,
    docData: { documentType: string; fileName: string; fileUrl: string }
  ): Promise<ClearanceDocument> => {
    const response = await apiClient.post(`/clearance/requests/${id}/documents`, docData);
    return response.data.data;
  },

  /**
   * Send message on clearance request thread
   */
  sendMessage: async (
    id: string,
    message: string,
    attachmentUrl?: string
  ): Promise<ClearanceMessage> => {
    const response = await apiClient.post(`/clearance/requests/${id}/messages`, {
      message,
      attachmentUrl,
    });
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
