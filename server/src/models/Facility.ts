import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FacilityAttributes {
  id: string;
  code: string;
  name: string;
  location: string;
  country: 'CN' | 'NG' | string;
  type: 'regional_hub' | 'dist_center' | 'fulfillment' | 'cross_dock';
  status: 'active' | 'at_capacity' | 'inactive';
  capacityUtilization: number;
  currentVolume: string;
  maxVolume: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FacilityCreationAttributes = Optional<FacilityAttributes, 'id' | 'status' | 'capacityUtilization'>;

export class Facility extends Model<FacilityAttributes, FacilityCreationAttributes> implements FacilityAttributes {
  public declare id: string;
  public declare code: string;
  public declare name: string;
  public declare location: string;
  public declare country: string;
  public declare type: 'regional_hub' | 'dist_center' | 'fulfillment' | 'cross_dock';
  public declare status: 'active' | 'at_capacity' | 'inactive';
  public declare capacityUtilization: number;
  public declare currentVolume: string;
  public declare maxVolume: string;
  public declare address?: string;
  public declare contactName?: string;
  public declare contactPhone?: string;
  public declare contactEmail?: string;
  public declare imageUrl?: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Facility.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NG',
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'regional_hub',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
    capacityUtilization: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currentVolume: {
      type: DataTypes.STRING,
      defaultValue: '0 packages',
    },
    maxVolume: {
      type: DataTypes.STRING,
      defaultValue: '1,000 pkgs/day',
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'facilities',
    timestamps: true,
  }
);
