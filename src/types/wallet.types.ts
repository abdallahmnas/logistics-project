export type TransactionType =
  | 'credit'
  | 'debit'
  | 'escrow_hold'
  | 'escrow_release'
  | 'refund';

export type TransactionCategory =
  | 'top_up'
  | 'shipping_payment'
  | 'procurement_payment'
  | 'exchange_payment'
  | 'delivery_payment'
  | 'refund'
  | 'bonus';

export interface WalletTransaction {
  id: string;
  customerId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: 'NGN';
  balanceAfter: number;
  description: string;
  referenceId?: string; // Linked shipment/exchange/delivery ID
  reference?: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  customerId: string;
  balance: number;
  currency: 'NGN';
  escrowHeld: number;
  availableBalance: number;
  lastTopUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopUpPayload {
  amount: number;
  paymentMethod: 'bank_transfer' | 'card';
}

export interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
}
