import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface DeliveryVehicleAttributes {
  id: string;
  name: string;
  type: string; // 'motorbike' | 'sedan' | 'van' | 'truck'
  imageUrl?: string;
  description?: string;
  priceLagos: number;
  priceKano: number;
  priceInterstate: number;
  perKmRate?: number;
  maxWeightKg?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DeliveryVehicleCreationAttributes = Optional<
  DeliveryVehicleAttributes,
  'id' | 'imageUrl' | 'description' | 'perKmRate' | 'maxWeightKg' | 'isActive'
>;

export class DeliveryVehicle
  extends Model<DeliveryVehicleAttributes, DeliveryVehicleCreationAttributes>
  implements DeliveryVehicleAttributes
{
  public declare id: string;
  public declare name: string;
  public declare type: string;
  public declare imageUrl?: string;
  public declare description?: string;
  public declare priceLagos: number;
  public declare priceKano: number;
  public declare priceInterstate: number;
  public declare perKmRate?: number;
  public declare maxWeightKg?: number;
  public declare isActive: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

DeliveryVehicle.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'sedan',
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priceLagos: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 2500,
    },
    priceKano: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 2000,
    },
    priceInterstate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 8500,
    },
    perKmRate: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 150,
    },
    maxWeightKg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 50,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'delivery_vehicles',
    timestamps: true,
  }
);
