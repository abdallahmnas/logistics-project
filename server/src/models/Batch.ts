import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BatchAttributes {
  id: string;
  masterTrackingId: string;
  carrierName: string;
  flightVoyageNo: string;
  containerNo?: string;
  shippingType: 'air' | 'sea';
  status:
    | 'order_created'
    | 'pre_alerted'
    | 'received_cn'
    | 'measured'
    | 'consolidating'
    | 'packed'
    | 'shipped'
    | 'shipping_exported'
    | 'arrived_ng'
    | 'customs_clearance'
    | 'ready_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'held_customs';
  consolidationIds?: string[];
  packageIds?: string[];
  consolidationCount?: number;
  packageCount?: number;
  totalWeightKg: number;
  totalCbm: number;
  departureDate?: Date;
  expectedArrivalDate?: Date;
  actualArrivalDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BatchCreationAttributes = Optional<BatchAttributes, 'id' | 'status'>;

export class Batch extends Model<BatchAttributes, BatchCreationAttributes> implements BatchAttributes {
  public declare id: string;
  public declare masterTrackingId: string;
  public declare carrierName: string;
  public declare flightVoyageNo: string;
  public declare containerNo?: string;
  public declare shippingType: 'air' | 'sea';
  public declare status:
    | 'order_created'
    | 'pre_alerted'
    | 'received_cn'
    | 'measured'
    | 'consolidating'
    | 'packed'
    | 'shipped'
    | 'shipping_exported'
    | 'arrived_ng'
    | 'customs_clearance'
    | 'ready_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'held_customs';
  public declare consolidationIds?: string[];
  public declare packageIds?: string[];
  public declare consolidationCount?: number;
  public declare packageCount?: number;
  public declare totalWeightKg: number;
  public declare totalCbm: number;
  public declare departureDate?: Date;
  public declare expectedArrivalDate?: Date;
  public declare actualArrivalDate?: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Batch.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    masterTrackingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    carrierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    flightVoyageNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    containerNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'order_created',
        'pre_alerted',
        'received_cn',
        'measured',
        'consolidating',
        'packed',
        'shipped',
        'shipping_exported',
        'arrived_ng',
        'customs_clearance',
        'ready_for_delivery',
        'delivered',
        'cancelled',
        'held_customs'
      ),
      defaultValue: 'shipped',
    },
    consolidationIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    packageIds: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    consolidationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    packageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalWeightKg: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalCbm: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    departureDate: { type: DataTypes.DATE, allowNull: true },
    expectedArrivalDate: { type: DataTypes.DATE, allowNull: true },
    actualArrivalDate: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'batches',
    timestamps: true,
  }
);
