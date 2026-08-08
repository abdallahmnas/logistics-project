export type DeliveryStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'out_for_pickup'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type VehicleType = 'motorbike' | 'sedan' | 'box_truck';

export interface LocalDelivery {
  id: string;
  customerId: string;
  customerName: string;
  status: DeliveryStatus;
  // Addresses
  pickupAddress: string;
  pickupCity: string;
  pickupPhone: string;
  pickupContactName: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffPhone: string;
  dropoffContactName: string;
  // Package details
  packageDescription: string;
  packagePhotos?: string[];
  handlingInstructions?: string; // 'fragile' | 'keep_upright' | etc
  estimatedWeightKg?: number;
  // Logistics
  vehicleType: VehicleType;
  distanceKm: number;
  baseFare: number;
  distanceFee: number;
  totalFee: number;
  paymentMethod: 'wallet' | 'cash_on_delivery';
  paymentStatus: 'unpaid' | 'paid';
  // Driver
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  verificationPin?: string;
  // Timestamps
  requestedAt: string;
  confirmedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalDeliveryPayload {
  pickupAddress: string;
  pickupCity: string;
  pickupPhone: string;
  pickupContactName: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffPhone: string;
  dropoffContactName: string;
  packageDescription: string;
  packagePhotos?: string[];
  handlingInstructions?: string;
  estimatedWeightKg?: number;
  vehicleType: VehicleType;
  paymentMethod: 'wallet' | 'cash_on_delivery';
}

export interface DeliveryState {
  deliveries: LocalDelivery[];
  selectedDelivery: LocalDelivery | null;
  loading: boolean;
  error: string | null;
}
