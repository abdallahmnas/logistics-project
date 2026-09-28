export type ClearanceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENT_REVIEW'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'CLEARANCE_PROCESSING'
  | 'CUSTOMS_ASSESSMENT'
  | 'INSPECTION'
  | 'AWAITING_PAYMENT'
  | 'CUSTOMS_RELEASED'
  | 'DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface ClearanceItem {
  id?: string;
  clearanceRequestId?: string;
  productName: string;
  description?: string;
  category?: string;
  quantity: number;
  unit: string;
  value: number;
  currency: string;
  countryOfManufacture?: string;
  hsCode?: string;
  weight?: number;
  volume?: number;
}

export interface ClearanceDocument {
  id?: string;
  clearanceRequestId?: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: 'uploaded' | 'under_review' | 'accepted' | 'more_info_required';
  notes?: string;
  isMissingNoted?: boolean;
  createdAt?: string;
}

export interface ClearanceCharge {
  id?: string;
  clearanceRequestId?: string;
  category: 'customs_duty' | 'service_fee' | 'delivery_fee' | 'terminal_handling' | 'documentation' | 'other';
  description: string;
  amount: number;
  currency: string;
  isConfirmed: boolean;
  status: 'pending' | 'paid' | 'waived';
  createdAt?: string;
}

export interface ClearanceMessage {
  id?: string;
  clearanceRequestId?: string;
  senderId?: string;
  senderName: string;
  senderRole: 'customer' | 'system' | 'support';
  message: string;
  attachmentUrl?: string;
  isSystemMessage: boolean;
  createdAt?: string;
}

export interface ClearanceStatusHistory {
  id?: string;
  clearanceRequestId?: string;
  status: ClearanceStatus;
  message: string;
  createdAt?: string;
}

export interface ClearanceRequest {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shipmentType: 'sea' | 'air' | 'land';
  originCountry: string;
  portOfEntry: string;
  shipmentStatus: 'not_shipped' | 'in_transit' | 'arrived_ng' | 'at_terminal' | 'arrived_uncleared';
  shippingLine?: string;
  airline?: string;
  billOfLadingNumber?: string;
  airWaybillNumber?: string;
  containerNumber?: string;
  estimatedArrivalDate?: string;
  noShippingInfoProvided?: boolean;
  status: ClearanceStatus;
  deliveryPreference: 'deliver_to_me' | 'self_pickup';
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  city?: string;
  state?: string;
  deliveryInstructions?: string;
  totalValueUsd?: number;
  totalProductsCount?: number;
  isConfirmedAccurate?: boolean;
  items?: ClearanceItem[];
  documents?: ClearanceDocument[];
  charges?: ClearanceCharge[];
  messages?: ClearanceMessage[];
  history?: ClearanceStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export const STATUS_DESCRIPTIONS: Record<ClearanceStatus, { label: string; description: string; badgeColor: string }> = {
  DRAFT: {
    label: 'Draft',
    description: 'Your request draft has been saved. Complete all steps to submit.',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
  SUBMITTED: {
    label: 'Submitted',
    description: 'Your request has been submitted and received.',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  DOCUMENT_REVIEW: {
    label: 'Reviewing Documents',
    description: 'Your shipping documents are being reviewed by our clearance specialists.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  ADDITIONAL_INFORMATION_REQUIRED: {
    label: 'Action Required',
    description: 'We need additional information or documents from you to proceed.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
  },
  CLEARANCE_PROCESSING: {
    label: 'Clearance Processing',
    description: 'Your shipment is currently being processed through customs.',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  CUSTOMS_ASSESSMENT: {
    label: 'Customs Assessment',
    description: 'Your shipment is undergoing official customs valuation and assessment.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  INSPECTION: {
    label: 'Physical Inspection',
    description: 'Your shipment is undergoing physical inspection at the port/terminal.',
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  AWAITING_PAYMENT: {
    label: 'Awaiting Payment',
    description: 'Customs duty or clearance service payment is required before release.',
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  },
  CUSTOMS_RELEASED: {
    label: 'Customs Released',
    description: 'Your goods have been released by Nigerian Customs.',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  DELIVERY: {
    label: 'In Delivery / Dispatch',
    description: 'Your goods are prepared and dispatched for doorstep delivery.',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  COMPLETED: {
    label: 'Completed',
    description: 'Your customs clearance request has been successfully completed.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    description: 'This clearance request has been cancelled.',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  ON_HOLD: {
    label: 'On Hold',
    description: 'This request is temporarily on hold pending resolution.',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-400',
  },
};
