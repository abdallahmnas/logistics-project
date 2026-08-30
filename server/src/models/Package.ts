import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PackageAttributes {
  id: string;
  trackingId: string;
  chineseTrackingNo: string;
  customerId: string;
  customerName: string;
  status:
    | 'order_created'
    | 'pre_alerted'
    | 'received_cn'
    | 'measured'
    | 'consolidating'
    | 'packed'
    | 'shipped'
    | 'arrived_ng'
    | 'customs_clearance'
    | 'ready_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'held_customs';
  description: string;
  weightKg: number;
  cbm: number;
  dimensions?: { length: number; width: number; height: number };
  photos?: string[];
  linkedBatchId?: string;
  shippingMethod?: 'air' | 'sea';
  destinationWarehouse?: 'lagos' | 'abuja' | 'kano';
  invoiceAmount?: number;
  paymentMethod?: 'wallet' | 'pod' | 'cash_on_delivery' | 'bank_transfer';
  paymentStatus: 'unpaid' | 'paid' | 'pod_pending';
  preAlertDate: Date;
  receivedDate?: Date;
  shippedDate?: Date;
  arrivedDate?: Date;
  deliveredDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PackageCreationAttributes = Optional<PackageAttributes, 'id' | 'paymentStatus' | 'weightKg' | 'cbm'>;

export class Package extends Model<PackageAttributes, PackageCreationAttributes>
 implements PackageAttributes {
  public declare id: string;
  public declare trackingId: string;
  public declare chineseTrackingNo: string;
  public declare customerId: string;
  public declare customerName: string;
  public declare status:
    | 'order_created'
    | 'pre_alerted'
    | 'received_cn'
    | 'measured'
    | 'consolidating'
    | 'packed'
    | 'shipped'
    | 'arrived_ng'
    | 'customs_clearance'
    | 'ready_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'held_customs';
  public declare description: string;
  public declare weightKg: number;
  public declare cbm: number;
  public declare dimensions?: { length: number; width: number; height: number };
  public declare photos?: string[];
  public declare linkedBatchId?: string;
  public declare shippingMethod?: 'air' | 'sea';
  public declare destinationWarehouse?: 'lagos' | 'abuja' | 'kano';
  public declare invoiceAmount?: number;
  public declare paymentMethod?: 'wallet' | 'pod' | 'cash_on_delivery' | 'bank_transfer';
  public declare paymentStatus: 'unpaid' | 'paid' | 'pod_pending';
  public declare preAlertDate: Date;
  public declare receivedDate?: Date;
  public declare shippedDate?: Date;
  public declare arrivedDate?: Date;
  public declare deliveredDate?: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Package.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trackingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    chineseTrackingNo: {
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
    status: {
      type: DataTypes.STRING,
      defaultValue: 'order_created',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weightKg: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    cbm: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    dimensions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    photos: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    linkedBatchId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    destinationWarehouse: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    invoiceAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid', 'pod_pending'),
      defaultValue: 'unpaid',
    },
    preAlertDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    receivedDate: { type: DataTypes.DATE, allowNull: true },
    shippedDate: { type: DataTypes.DATE, allowNull: true },
    arrivedDate: { type: DataTypes.DATE, allowNull: true },
    deliveredDate: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'packages',
    timestamps: true,
  }
);
