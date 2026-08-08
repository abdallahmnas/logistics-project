import type { ShippingMethod, DestinationWarehouse, PaymentMethod } from './common.types';

export type ShipmentStatus =
  | 'pre_alerted'
  | 'received_cn'
  | 'ready_to_pack'
  | 'under_packing'
  | 'consolidating'
  | 'shipping_exported'
  | 'arrived_ng'
  | 'ready_for_pickup'
  | 'delivered'
  | 'cancelled';

export interface Package {
  id: string;
  trackingId: string; // Hamza RMB tracking ID
  chineseTrackingNo: string; // Chinese domestic tracking
  customerId: string;
  customerName: string;
  status: ShipmentStatus;
  description: string;
  weightKg: number;
  cbm: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  photos?: string[];
  linkedBatchId?: string;
  shippingMethod?: ShippingMethod;
  destinationWarehouse?: DestinationWarehouse;
  invoiceAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: 'unpaid' | 'paid' | 'pod_pending';
  preAlertDate: string;
  receivedDate?: string;
  shippedDate?: string;
  arrivedDate?: string;
  deliveredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Consolidation {
  id: string;
  consolidationId: string;
  customerId: string;
  customerName: string;
  packageIds: string[];
  shippingMethod: ShippingMethod;
  destinationWarehouse: DestinationWarehouse;
  paymentMethod: PaymentMethod;
  totalWeightKg: number;
  totalCbm: number;
  shippingFee: number;
  status: 'pending_packing' | 'ready_to_batch' | 'batched';
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  masterTrackingId: string;
  carrierName: string;
  flightVoyageNo: string;
  containerNo?: string;
  shippingType: ShippingMethod;
  status: ShipmentStatus;
  consolidationIds: string[];
  packageIds: string[];
  consolidationCount: number;
  totalWeightKg: number;
  totalCbm: number;
  departureDate?: string;
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsolidationRequest {
  packageIds: string[];
  shippingMethod: ShippingMethod;
  destinationWarehouse: DestinationWarehouse;
  paymentMethod: PaymentMethod;
}

export interface PreAlertPayload {
  chineseTrackingNo: string;
  supplierName: string;
  description: string;
  estimatedItems?: number;
  notes?: string;
  photos?: string[];
}

export interface ShipmentState {
  packages: Package[];
  selectedPackage: Package | null;
  consolidations: Consolidation[];
  batches: Batch[];
  filters: ShipmentFilters;
  loading: boolean;
  error: string | null;
}

export interface ShipmentFilters {
  status?: ShipmentStatus;
  shippingMethod?: ShippingMethod;
  dateRange?: { start: string; end: string };
  search?: string;
}

export interface ShipmentStatusHistory {
  status: ShipmentStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}
