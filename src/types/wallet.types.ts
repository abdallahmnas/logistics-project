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
  referenceId?: string;
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

export type WalletDepositStatus = 'pending' | 'approved' | 'rejected';

export interface WalletDeposit {
  id: string;
  userId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: 'NGN';
  senderName: string;
  paymentReceiptUrl: string;
  sessionId?: string;
  status: WalletDepositStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletState {
  wallet: Wallet | null;
  data?: Wallet | null;
  transactions: WalletTransaction[];
  deposits: WalletDeposit[];
  adminDeposits: WalletDeposit[];
  loading: boolean;
  error: string | null;
}
