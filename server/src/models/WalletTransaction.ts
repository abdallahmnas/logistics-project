import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface WalletTransactionAttributes {
  id: string;
  customerId: string;
  type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'refund';
  category: 'top_up' | 'shipping_payment' | 'procurement_payment' | 'exchange_payment' | 'delivery_payment' | 'refund' | 'bonus';
  amount: number;
  currency: string;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WalletTransactionCreationAttributes = Optional<WalletTransactionAttributes, 'id'>;

export class WalletTransaction extends Model<WalletTransactionAttributes, WalletTransactionCreationAttributes> implements WalletTransactionAttributes {
  public declare id: string;
  public declare customerId: string;
  public declare type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'refund';
  public declare category: 'top_up' | 'shipping_payment' | 'procurement_payment' | 'exchange_payment' | 'delivery_payment' | 'refund' | 'bonus';
  public declare amount: number;
  public declare currency: string;
  public declare balanceAfter: number;
  public declare description: string;
  public declare referenceId?: string;
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
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('credit', 'debit', 'escrow_hold', 'escrow_release', 'refund'),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('top_up', 'shipping_payment', 'procurement_payment', 'exchange_payment', 'delivery_payment', 'refund', 'bonus'),
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
  },
  {
    sequelize,
    tableName: 'wallet_transactions',
    timestamps: true,
  }
);
