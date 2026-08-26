// Common shared types used across the application

export type UserRole =
  | 'customer'
  | 'super_admin'
  | 'admin'
  | 'warehouse_cn'
  | 'warehouse_ng'
  | 'procurement'
  | 'clearance_agent'
  | 'driver';

export type ShippingMethod = 'air' | 'sea';

export type DestinationWarehouse = 'lagos' | 'abuja' | 'kano';

export type PaymentMethod = 'wallet' | 'pod' | 'cash_on_delivery' | 'bank_transfer';

export type Currency = 'NGN' | 'CNY';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface WarehouseInfo {
  id: string;
  name: string;
  location: DestinationWarehouse | 'guangzhou';
  address: string;
  phone: string;
  email: string;
  country: 'china' | 'nigeria';
}
