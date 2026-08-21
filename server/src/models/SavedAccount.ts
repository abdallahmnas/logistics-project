import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SavedAccountAttributes {
  id: string;
  userId: string;
  label: string;
  platform: 'wechat_pay' | 'alipay' | 'chinese_bank';
  accountNumber: string;
  accountName: string;
  barcodeUrl?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SavedAccountCreationAttributes = Optional<SavedAccountAttributes, 'id' | 'isDefault'>;

export class SavedAccount extends Model<SavedAccountAttributes, SavedAccountCreationAttributes> implements SavedAccountAttributes {
  public declare id: string;
  public declare userId: string;
  public declare label: string;
  public declare platform: 'wechat_pay' | 'alipay' | 'chinese_bank';
  public declare accountNumber: string;
  public declare accountName: string;
  public declare barcodeUrl?: string;
  public declare isDefault?: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

SavedAccount.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Receiving Account',
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'wechat_pay',
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    barcodeUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'saved_accounts',
    timestamps: true,
  }
);
