import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LocalDeliveryAttributes {
  id: string;
  customerId: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'driver_assigned' | 'out_for_pickup' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  pickupAddress: string;
  pickupCity: string;
  pickupPhone: string;
  pickupContactName: string;
  dropoffAddress: string;
  dropoffCity: string;
  dropoffPhone: string;
  dropoffContactName: string;
  packageDescription: string;
  packagePhotos?: string[];
  handlingInstructions?: string;
  estimatedWeightKg?: number;
  vehicleType: 'motorbike' | 'sedan' | 'box_truck';
  distanceKm: number;
  baseFare: number;
  distanceFee: number;
  totalFee: number;
  paymentMethod: 'wallet' | 'cash_on_delivery';
  paymentStatus: 'unpaid' | 'paid';
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  verificationPin?: string;
  requestedAt: Date;
  confirmedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LocalDeliveryCreationAttributes = Optional<LocalDeliveryAttributes, 'id' | 'status' | 'requestedAt'>;

export class LocalDelivery extends Model<LocalDeliveryAttributes, LocalDeliveryCreationAttributes> implements LocalDeliveryAttributes {
  public declare id: string;
  public declare customerId: string;
  public declare customerName: string;
  public declare status: 'pending' | 'confirmed' | 'driver_assigned' | 'out_for_pickup' | 'in_transit' | 'delivered' | 'cancelled' | 'failed';
  public declare pickupAddress: string;
  public declare pickupCity: string;
  public declare pickupPhone: string;
  public declare pickupContactName: string;
  public declare dropoffAddress: string;
  public declare dropoffCity: string;
  public declare dropoffPhone: string;
  public declare dropoffContactName: string;
  public declare packageDescription: string;
  public declare packagePhotos?: string[];
  public declare handlingInstructions?: string;
  public declare estimatedWeightKg?: number;
  public declare vehicleType: 'motorbike' | 'sedan' | 'box_truck';
  public declare distanceKm: number;
  public declare baseFare: number;
  public declare distanceFee: number;
  public declare totalFee: number;
  public declare paymentMethod: 'wallet' | 'cash_on_delivery';
  public declare paymentStatus: 'unpaid' | 'paid';
  public declare driverId?: string;
  public declare driverName?: string;
  public declare driverPhone?: string;
  public declare verificationPin?: string;
  public declare requestedAt: Date;
  public declare confirmedAt?: Date;
  public declare pickedUpAt?: Date;
  public declare deliveredAt?: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

LocalDelivery.init(
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
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'driver_assigned',
        'out_for_pickup',
        'in_transit',
        'delivered',
        'cancelled',
        'failed'
      ),
      defaultValue: 'pending',
    },
    pickupAddress: { type: DataTypes.STRING, allowNull: false },
    pickupCity: { type: DataTypes.STRING, allowNull: false },
    pickupPhone: { type: DataTypes.STRING, allowNull: false },
    pickupContactName: { type: DataTypes.STRING, allowNull: false },
    dropoffAddress: { type: DataTypes.STRING, allowNull: false },
    dropoffCity: { type: DataTypes.STRING, allowNull: false },
    dropoffPhone: { type: DataTypes.STRING, allowNull: false },
    dropoffContactName: { type: DataTypes.STRING, allowNull: false },
    packageDescription: { type: DataTypes.TEXT, allowNull: false },
    packagePhotos: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
    handlingInstructions: { type: DataTypes.STRING, allowNull: true },
    estimatedWeightKg: { type: DataTypes.FLOAT, allowNull: true },
    vehicleType: {
      type: DataTypes.ENUM('motorbike', 'sedan', 'box_truck'),
      allowNull: false,
    },
    distanceKm: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    baseFare: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    distanceFee: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    totalFee: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    paymentMethod: {
      type: DataTypes.ENUM('wallet', 'cash_on_delivery'),
      allowNull: false,
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid'),
      defaultValue: 'unpaid',
    },
    driverId: { type: DataTypes.STRING, allowNull: true },
    driverName: { type: DataTypes.STRING, allowNull: true },
    driverPhone: { type: DataTypes.STRING, allowNull: true },
    verificationPin: { type: DataTypes.STRING, allowNull: true },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    confirmedAt: { type: DataTypes.DATE, allowNull: true },
    pickedUpAt: { type: DataTypes.DATE, allowNull: true },
    deliveredAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'local_deliveries',
    timestamps: true,
  }
);
