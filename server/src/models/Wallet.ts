import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export interface WalletAttributes {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  escrowHeld: number;
  availableBalance: number;
  lastTopUpAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type WalletCreationAttributes = Optional<WalletAttributes, 'id' | 'escrowHeld' | 'availableBalance'>;

export class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public declare id: string;
  public declare userId: string;
  public declare balance: number;
  public declare currency: string;
  public declare escrowHeld: number;
  public declare availableBalance: number;
  public declare lastTopUpAt?: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Wallet.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: User, key: 'id' },
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN',
    },
    escrowHeld: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    availableBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    lastTopUpAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'wallets',
    timestamps: true,
  }
);
