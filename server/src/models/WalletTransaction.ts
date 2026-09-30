import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface WalletTransactionAttributes {
  id: string;
  userId?: string;
  walletId?: string;
  customerId?: string;
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'refund' | string;
  category: 'top_up' | 'shipping_payment' | 'procurement_payment' | 'exchange_payment' | 'delivery_payment' | 'clearance_fee' | 'clearance_payment' | 'refund' | 'bonus' | string;
  amount: number;
  currency: string;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  reference?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WalletTransactionCreationAttributes = Optional<WalletTransactionAttributes, 'id'>;

export class WalletTransaction extends Model<WalletTransactionAttributes, WalletTransactionCreationAttributes> implements WalletTransactionAttributes {
  public declare id: string;
  public declare userId?: string;
  public declare walletId?: string;
  public declare customerId?: string;
  public declare type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'refund' | string;
  public declare category: 'top_up' | 'shipping_payment' | 'procurement_payment' | 'exchange_payment' | 'delivery_payment' | 'clearance_fee' | 'clearance_payment' | 'refund' | 'bonus' | string;
  public declare amount: number;
  public declare currency: string;
  public declare balanceAfter: number;
  public declare description: string;
  public declare referenceId?: string;
  public declare reference?: string;
  public declare status?: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

WalletTransaction.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    walletId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN',
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'completed',
    },
  },
  {
    sequelize,
    tableName: 'wallet_transactions',
    timestamps: true,
  }
);
