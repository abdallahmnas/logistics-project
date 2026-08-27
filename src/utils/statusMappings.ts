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
  order_created: {
    label: 'Order Created',
    color: '#64748B',
    badgeStatus: 'default',
    description: 'Shipment order initiated',
  },
  pre_alerted: {
    label: 'Pre-Alerted',
    color: '#8B5CF6',
    badgeStatus: 'default',
    description: 'Tracking details provided by customer',
  },
  received_cn: {
    label: 'Received in China Warehouse',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Package received at China facility',
  },
  measured: {
    label: 'Measured',
    color: '#06B6D4',
    badgeStatus: 'processing',
    description: 'Weight and CBM dimensions recorded',
  },
  consolidating: {
    label: 'Consolidated',
    color: '#F97316',
    badgeStatus: 'warning',
    description: 'Combined with other items into shipment batch',
  },
  packed: {
    label: 'Packed',
    color: '#F59E0B',
    badgeStatus: 'warning',
    description: 'Securely packaged for export',
  },
  shipped: {
    label: 'Shipped',
    color: '#6366F1',
    badgeStatus: 'processing',
    description: 'Dispatched and in transit to Nigeria',
  },
  arrived_ng: {
    label: 'Arrived Nigeria',
    color: '#10B981',
    badgeStatus: 'success',
    description: 'Landed at Nigerian port / hub facility',
  },
  customs_clearance: {
    label: 'Customs',
    color: '#EC4899',
    badgeStatus: 'processing',
    description: 'Undergoing customs inspection and duty processing',
  },
  ready_for_delivery: {
    label: 'Ready for Delivery',
    color: '#22C55E',
    badgeStatus: 'success',
    description: 'Cleared customs and ready for doorstep delivery / hub pickup',
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
    description: 'Shipment order cancelled',
  },
  held_customs: {
    label: 'Held at Customs',
    color: '#DC2626',
    badgeStatus: 'error',
    description: 'Held for additional documentation or inspection',
  },
  requested: {
    label: 'Request Pending',
    color: '#8B5CF6',
    badgeStatus: 'default',
    description: 'Customer consolidation request received',
  },
  pending_packing: {
    label: 'Pending Packaging',
    color: '#F97316',
    badgeStatus: 'warning',
    description: 'Awaiting warehouse packaging',
  },
  packaging: {
    label: 'In Packaging',
    color: '#3B82F6',
    badgeStatus: 'processing',
    description: 'Currently opening & re-packing into master box',
  },
  packaged: {
    label: 'Packaged & Sealed',
    color: '#06B6D4',
    badgeStatus: 'processing',
    description: 'Re-packed into single box & re-weighed',
  },
  ready_to_batch: {
    label: 'Ready for Batching',
    color: '#10B981',
    badgeStatus: 'success',
    description: 'Quality inspection passed; ready for master batch',
  },
  batched: {
    label: 'Batched',
    color: '#059669',
    badgeStatus: 'success',
    description: 'Assigned to Master Flight/Container Batch',
  },
};

export const SHIPMENT_STATUS_STEPS: { key: ShipmentStatus; title: string }[] = [
  { key: 'order_created', title: 'Order Created' },
  { key: 'received_cn', title: 'Received in China WH' },
  { key: 'measured', title: 'Measured' },
  { key: 'consolidating', title: 'Consolidated' },
  { key: 'packed', title: 'Packed' },
  { key: 'shipped', title: 'Shipped' },
  { key: 'arrived_ng', title: 'Arrived Nigeria' },
  { key: 'customs_clearance', title: 'Customs' },
  { key: 'ready_for_delivery', title: 'Ready for Delivery' },
  { key: 'delivered', title: 'Delivered' },
];

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
