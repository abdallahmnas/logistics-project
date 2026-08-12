import type { ShipmentStatus } from '../types/shipment.types';
import type { ProcurementStatus } from '../types/procurement.types';
import type { ExchangeStatus } from '../types/exchange.types';
import type { DeliveryStatus } from '../types/delivery.types';

type BadgeStatus = 'success' | 'processing' | 'error' | 'default' | 'warning';

interface StatusConfig {
  label: string;
  color: string;
  badgeStatus: BadgeStatus;
  description: string;
}

// Shipment Status Mappings
export const shipmentStatusMap: Record<ShipmentStatus, StatusConfig> = {
  pre_alerted: {
    label: 'Pre-Alerted',
    color: '#8B5CF6',
    badgeStatus: 'default',
    description: 'Tracking number submitted, awaiting warehouse arrival',
  },
  received_cn: {
    label: 'Received at China WH',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Package received and measured at Guangzhou hub',
  },
  ready_to_pack: {
    label: 'Ready to Pack',
    color: '#06B6D4',
    badgeStatus: 'processing',
    description: 'Available for consolidation selection',
  },
  under_packing: {
    label: 'Under Packing',
    color: '#F59E0B',
    badgeStatus: 'warning',
    description: 'Being consolidated and packed for shipment',
  },
  consolidating: {
    label: 'Consolidating',
    color: '#F97316',
    badgeStatus: 'warning',
    description: 'Bound to a master shipment batch',
  },
  shipping_exported: {
    label: 'Shipped / In Transit',
    color: '#6366F1',
    badgeStatus: 'processing',
    description: 'Batch has departed China',
  },
  arrived_ng: {
    label: 'Arrived in Nigeria',
    color: '#10B981',
    badgeStatus: 'success',
    description: 'Cleared customs and arrived at destination warehouse',
  },
  ready_for_pickup: {
    label: 'Ready for Pickup',
    color: '#22C55E',
    badgeStatus: 'success',
    description: 'Sorted and awaiting customer collection or delivery',
  },
  delivered: {
    label: 'Delivered',
    color: '#059669',
    badgeStatus: 'success',
    description: 'Successfully delivered to customer',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    badgeStatus: 'error',
    description: 'Shipment has been cancelled',
  },
  held_customs: {
    label: 'Held in Customs',
    color: '#EF4444',
    badgeStatus: 'error',
    description: 'Package held for customs inspection',
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Package received at warehouse',
  },
  at_china_warehouse: {
    label: 'At China Warehouse',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Package located at China hub',
  },
};

// Procurement Status Mappings
export const procurementStatusMap: Record<ProcurementStatus, StatusConfig> = {
  submitted: {
    label: 'Submitted',
    color: '#8B5CF6',
    badgeStatus: 'default',
    description: 'Request submitted, awaiting review',
  },
  under_review: {
    label: 'Under Review',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Procurement agent is reviewing the request',
  },
  quoted: {
    label: 'Quoted',
    color: '#F59E0B',
    badgeStatus: 'warning',
    description: 'Price quote generated, awaiting approval',
  },
  approved: {
    label: 'Approved',
    color: '#06B6D4',
    badgeStatus: 'processing',
    description: 'Customer approved, funds escrowed',
  },
  purchasing: {
    label: 'Purchasing',
    color: '#6366F1',
    badgeStatus: 'processing',
    description: 'Agent is buying from supplier',
  },
  shipped_to_wh: {
    label: 'Shipped to Warehouse',
    color: '#F97316',
    badgeStatus: 'processing',
    description: 'Supplier shipped, en route to Guangzhou hub',
  },
  received_at_wh: {
    label: 'Received at Warehouse',
    color: '#10B981',
    badgeStatus: 'success',
    description: 'Items received at Guangzhou, merged to shipping pipeline',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    badgeStatus: 'error',
    description: 'Request cancelled',
  },
  rejected: {
    label: 'Rejected',
    color: '#DC2626',
    badgeStatus: 'error',
    description: 'Request rejected by procurement team',
  },
};

// Exchange Status Mappings
export const exchangeStatusMap: Record<ExchangeStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: '#8B5CF6',
    badgeStatus: 'default',
    description: 'Exchange request submitted',
  },
  awaiting_payment: {
    label: 'Awaiting Payment',
    color: '#F59E0B',
    badgeStatus: 'warning',
    description: 'Waiting for Naira transfer to escrow account',
  },
  receipt_uploaded: {
    label: 'Receipt Uploaded',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Payment proof submitted, pending verification',
  },
  naira_confirmed: {
    label: 'Naira Confirmed',
    color: '#06B6D4',
    badgeStatus: 'processing',
    description: 'Naira deposit verified by admin',
  },
  rmb_released: {
    label: 'RMB Released',
    color: '#10B981',
    badgeStatus: 'processing',
    description: 'RMB sent to designated account',
  },
  completed: {
    label: 'Completed',
    color: '#059669',
    badgeStatus: 'success',
    description: 'Exchange completed successfully',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    badgeStatus: 'error',
    description: 'Exchange request cancelled',
  },
  disputed: {
    label: 'Disputed',
    color: '#DC2626',
    badgeStatus: 'error',
    description: 'Exchange under dispute review',
  },
};

// Delivery Status Mappings
export const deliveryStatusMap: Record<DeliveryStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: '#8B5CF6',
    badgeStatus: 'default',
    description: 'Delivery request submitted',
  },
  confirmed: {
    label: 'Confirmed',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Delivery confirmed and queued',
  },
  driver_assigned: {
    label: 'Driver Assigned',
    color: '#06B6D4',
    badgeStatus: 'processing',
    description: 'Driver has been assigned to your delivery',
  },
  out_for_pickup: {
    label: 'Out for Pickup',
    color: '#F59E0B',
    badgeStatus: 'warning',
    description: 'Driver is heading to pickup location',
  },
  in_transit: {
    label: 'In Transit',
    color: '#6366F1',
    badgeStatus: 'processing',
    description: 'Package secured and on the way',
  },
  delivered: {
    label: 'Delivered',
    color: '#059669',
    badgeStatus: 'success',
    description: 'Package delivered successfully',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#EF4444',
    badgeStatus: 'error',
    description: 'Delivery cancelled',
  },
  failed: {
    label: 'Failed',
    color: '#DC2626',
    badgeStatus: 'error',
    description: 'Delivery attempt failed',
  },
};

// Helper to get status config by module
export const getStatusConfig = (
  module: 'shipment' | 'procurement' | 'exchange' | 'delivery',
  status: string
): StatusConfig => {
  const maps = {
    shipment: shipmentStatusMap,
    procurement: procurementStatusMap,
    exchange: exchangeStatusMap,
    delivery: deliveryStatusMap,
  };
  
  const map = maps[module] as Record<string, StatusConfig>;
  return map[status] || { label: status, color: '#6B7280', badgeStatus: 'default' as BadgeStatus, description: '' };
};
