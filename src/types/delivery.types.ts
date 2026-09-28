export type DeliveryStatus =
  | 'pending'
  | 'confirmed'
  | 'driver_assigned'
  | 'out_for_pickup'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export type VehicleType = 'motorbike' | 'sedan' | 'van' | 'truck' | string;

export interface DeliveryVehicle {
  id: string;
  name: string;
  type: string;
  imageUrl?: string;
  description?: string;
  baseFare: number;
  perKmRate: number;
  priceLagos?: number;
  priceKano?: number;
  priceInterstate?: number;
  maxWeightKg?: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocalDelivery {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: DeliveryStatus;
  // Addresses & Coordinates
  pickupAddress: string;
  pickupCity: string;
  pickupPhone: string;
  pickupContactName: string;
  pickupEmail?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffPhone: string;
  dropoffContactName: string;
  dropoffEmail?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  // Package details
  packageDescription: string;
  packagePhotos?: string[];
  handlingInstructions?: string;
  estimatedWeightKg?: number;
  // Logistics
  vehicleType: string;
  vehicleId?: string;
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
  customerEmail?: string;
  customerPhone?: string;
  pickupAddress: string;
  pickupCity?: string;
  pickupPhone?: string;
  pickupContactName?: string;
  pickupEmail?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress: string;
  dropoffCity?: string;
  dropoffPhone: string;
  dropoffContactName: string;
  dropoffEmail?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  packageDescription: string;
  packagePhotos?: string[];
  handlingInstructions?: string;
  estimatedWeightKg?: number;
  vehicleId?: string;
  vehicleType?: string;
  distanceKm?: number;
  paymentMethod: 'wallet' | 'cash_on_delivery';
}

export interface DeliveryState {
  deliveries: LocalDelivery[];
  vehicles: DeliveryVehicle[];
  adminVehicles: DeliveryVehicle[];
  selectedDelivery: LocalDelivery | null;
  loading: boolean;
  error: string | null;
}
