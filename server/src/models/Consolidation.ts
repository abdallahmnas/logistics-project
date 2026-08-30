import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ConsolidationAttributes {
  id: string;
  consolidationId: string;
  customerId: string;
  customerName: string;
  packageIds: string[];
  shippingMethod: 'air' | 'sea';
  destinationWarehouse: 'lagos' | 'abuja' | 'kano';
  paymentMethod: 'wallet' | 'pod' | 'cash_on_delivery' | 'bank_transfer';
  totalWeightKg: number;
  totalCbm: number;
  shippingFee: number;
  originCountry?: string;
  status: 'requested' | 'pending_packing' | 'packaging' | 'packaged' | 'ready_to_batch' | 'batched';
  createdAt?: Date;
  updatedAt?: Date;
}

export type ConsolidationCreationAttributes = Optional<ConsolidationAttributes, 'id' | 'status'>;

export class Consolidation extends Model<ConsolidationAttributes, ConsolidationCreationAttributes> implements ConsolidationAttributes {
  public declare id: string;
  public declare consolidationId: string;
  public declare customerId: string;
  public declare customerName: string;
  public declare packageIds: string[];
  public declare shippingMethod: 'air' | 'sea';
  public declare destinationWarehouse: 'lagos' | 'abuja' | 'kano';
  public declare paymentMethod: 'wallet' | 'pod' | 'cash_on_delivery' | 'bank_transfer';
  public declare totalWeightKg: number;
  public declare totalCbm: number;
  public declare shippingFee: number;
  public declare originCountry?: string;
  public declare status: 'requested' | 'pending_packing' | 'packaging' | 'packaged' | 'ready_to_batch' | 'batched';
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Consolidation.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consolidationId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    packageIds: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    shippingMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destinationWarehouse: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalWeightKg: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalCbm: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    shippingFee: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    originCountry: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'requested',
    },
  },
  {
    sequelize,
    tableName: 'consolidations',
    timestamps: true,
  }
);
