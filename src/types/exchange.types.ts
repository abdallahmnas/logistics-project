export type ExchangeStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'receipt_uploaded'
  | 'naira_confirmed'
  | 'rmb_released'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type RmbDestinationType = 'alipay' | 'wechat_pay' | 'chinese_bank';

export interface ExchangeRequest {
  id: string;
  customerId: string;
  customerName: string;
  amountNaira: number;
  amountRmb: number;
  exchangeRate: number;
  platformFee: number;
  totalNaira: number;
  status: ExchangeStatus;
  // Payment details
  escrowBankName: string;
  escrowAccountNo: string;
  escrowAccountName: string;
  nairaReceiptUrl?: string;
  // RMB destination
  rmbDestType: RmbDestinationType;
  rmbDestAccount: string;
  rmbDestName: string;
  rmbDestQrCode?: string;
  rmbReceiptUrl?: string;
  // Timestamps
  requestedAt: string;
  nairaConfirmedAt?: string;
  rmbReleasedAt?: string;
  completedAt?: string;
  expiresAt: string; // Rate lock expiry
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRequestPayload {
  amountNaira: number;
  rmbDestType: RmbDestinationType;
  rmbDestAccount: string;
  rmbDestName: string;
  rmbDestQrCode?: string;
}

export interface ExchangeRate {
  id: string;
  buyRate: number; // NGN per 1 CNY
  sellRate: number;
  platformRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface SavedAccount {
  id: string;
  userId: string;
  label: string;
  platform: RmbDestinationType;
  accountNumber: string;
  accountName: string;
  barcodeUrl?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExchangeState {
  exchanges: ExchangeRequest[];
  savedAccounts: SavedAccount[];
  selectedExchange: ExchangeRequest | null;
  activeRate: ExchangeRate | null;
  loading: boolean;
  error: string | null;
}
