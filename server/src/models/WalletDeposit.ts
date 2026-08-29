import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type WalletDepositStatus = 'pending' | 'approved' | 'rejected';

export interface WalletDepositAttributes {
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
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WalletDepositCreationAttributes = Optional<
  WalletDepositAttributes,
  'id' | 'currency' | 'status' | 'sessionId' | 'rejectionReason' | 'reviewedBy' | 'reviewedAt'
>;

export class WalletDeposit
  extends Model<WalletDepositAttributes, WalletDepositCreationAttributes>
  implements WalletDepositAttributes
{
  public declare id: string;
  public declare userId: string;
  public declare customerId: string;
  public declare customerName: string;
  public declare amount: number;
  public declare currency: 'NGN';
  public declare senderName: string;
  public declare paymentReceiptUrl: string;
  public declare sessionId?: string;
  public declare status: WalletDepositStatus;
  public declare rejectionReason?: string;
  public declare reviewedBy?: string;
  public declare reviewedAt?: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

WalletDeposit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN',
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentReceiptUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'wallet_deposits',
    timestamps: true,
  }
);
