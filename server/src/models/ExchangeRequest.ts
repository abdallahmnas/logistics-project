import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ExchangeRequestAttributes {
  id: string;
  customerId: string;
  customerName: string;
  direction?: 'ngn_to_rmb' | 'rmb_to_ngn';
  amountNaira: number;
  amountRmb: number;
  exchangeRate: number;
  platformFee: number;
  totalNaira: number;
  status: 'pending' | 'awaiting_payment' | 'receipt_uploaded' | 'naira_confirmed' | 'rmb_released' | 'completed' | 'cancelled' | 'disputed';
  escrowBankName: string;
  escrowAccountNo: string;
  escrowAccountName: string;
  nairaReceiptUrl?: string;
  rmbDestType: 'alipay' | 'wechat_pay' | 'chinese_bank';
  rmbDestAccount: string;
  rmbDestName: string;
  rmbDestQrCode?: string;
  receivingBarcodeUrl?: string;
  rmbReceiptUrl?: string;
  requestedAt: Date;
  nairaConfirmedAt?: Date;
  rmbReleasedAt?: Date;
  completedAt?: Date;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ExchangeRequestCreationAttributes = Optional<ExchangeRequestAttributes, 'id' | 'status' | 'requestedAt'>;

export class ExchangeRequest extends Model<ExchangeRequestAttributes, ExchangeRequestCreationAttributes> implements ExchangeRequestAttributes {
  public declare id: string;
  public declare customerId: string;
  public declare customerName: string;
  public declare direction?: 'ngn_to_rmb' | 'rmb_to_ngn';
  public declare amountNaira: number;
  public declare amountRmb: number;
  public declare exchangeRate: number;
  public declare platformFee: number;
  public declare totalNaira: number;
  public declare status: 'pending' | 'awaiting_payment' | 'receipt_uploaded' | 'naira_confirmed' | 'rmb_released' | 'completed' | 'cancelled' | 'disputed';
  public declare escrowBankName: string;
  public declare escrowAccountNo: string;
  public declare escrowAccountName: string;
  public declare nairaReceiptUrl?: string;
  public declare rmbDestType: 'alipay' | 'wechat_pay' | 'chinese_bank';
  public declare rmbDestAccount: string;
  public declare rmbDestName: string;
  public declare rmbDestQrCode?: string;
  public declare receivingBarcodeUrl?: string;
  public declare rmbReceiptUrl?: string;
  public declare requestedAt: Date;
  public declare nairaConfirmedAt?: Date;
  public declare rmbReleasedAt?: Date;
  public declare completedAt?: Date;
  public declare expiresAt: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ExchangeRequest.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    direction: {
      type: DataTypes.ENUM('ngn_to_rmb', 'rmb_to_ngn'),
      allowNull: true,
      defaultValue: 'ngn_to_rmb',
    },
    amountNaira: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    amountRmb: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    exchangeRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    platformFee: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    totalNaira: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'awaiting_payment',
        'receipt_uploaded',
        'naira_confirmed',
        'rmb_released',
        'completed',
        'cancelled',
        'disputed'
      ),
      defaultValue: 'pending',
    },
    escrowBankName: { type: DataTypes.STRING, allowNull: false },
    escrowAccountNo: { type: DataTypes.STRING, allowNull: false },
    escrowAccountName: { type: DataTypes.STRING, allowNull: false },
    nairaReceiptUrl: { type: DataTypes.STRING, allowNull: true },
    rmbDestType: {
      type: DataTypes.ENUM('alipay', 'wechat_pay', 'chinese_bank'),
      allowNull: false,
    },
    rmbDestAccount: { type: DataTypes.STRING, allowNull: false },
    rmbDestName: { type: DataTypes.STRING, allowNull: false },
    rmbDestQrCode: { type: DataTypes.STRING, allowNull: true },
    receivingBarcodeUrl: { type: DataTypes.STRING, allowNull: true },
    rmbReceiptUrl: { type: DataTypes.STRING, allowNull: true },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    nairaConfirmedAt: { type: DataTypes.DATE, allowNull: true },
    rmbReleasedAt: { type: DataTypes.DATE, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
  },
  {
    sequelize,
    tableName: 'exchange_requests',
    timestamps: true,
  }
);
