export type ProcurementStatus =
  | 'submitted'
  | 'under_review'
  | 'quoted'
  | 'approved'
  | 'purchasing'
  | 'shipped_to_wh'
  | 'received_at_wh'
  | 'cancelled'
  | 'rejected';

export interface ProcurementRequest {
  id: string;
  customerId: string;
  customerName: string;
  productUrl: string;
  productPhotos: string[];
  quantity: number;
  specifications: string;
  sizes?: string;
  colors?: string;
  variations?: string;
  notes?: string;
  status: ProcurementStatus;
  // Pricing
  productCostRmb?: number;
  serviceFeeRmb?: number;
  totalCostRmb?: number;
  exchangeRateUsed?: number;
  totalCostNaira?: number;
  // Fulfillment
  supplierName?: string;
  chineseTrackingNo?: string;
  linkedShipmentId?: string;
  // Timestamps
  submittedAt: string;
  quotedAt?: string;
  approvedAt?: string;
  purchasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementSubmitPayload {
  productUrl: string;
  productPhotos: string[];
  quantity: number;
  specifications: string;
  sizes?: string;
  colors?: string;
  variations?: string;
  notes?: string;
}

export interface ProcurementQuotePayload {
  requestId: string;
  productCostRmb: number;
  serviceFeeRmb: number;
  supplierName: string;
}

export interface ProcurementState {
  requests: ProcurementRequest[];
  selectedRequest: ProcurementRequest | null;
  loading: boolean;
  error: string | null;
}
