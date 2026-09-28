import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ClearanceItemAttributes {
  id: string;
  clearanceRequestId: string;
  productName: string;
  description?: string;
  category?: string;
  quantity: number;
  unit: string;
  value: number;
  currency: string;
  countryOfManufacture?: string;
  hsCode?: string;
  weight?: number;
  volume?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceItemCreationAttributes = Optional<
  ClearanceItemAttributes,
  'id' | 'description' | 'category' | 'unit' | 'currency' | 'countryOfManufacture' | 'hsCode' | 'weight' | 'volume'
>;

export class ClearanceItem
  extends Model<ClearanceItemAttributes, ClearanceItemCreationAttributes>
  implements ClearanceItemAttributes {
  public declare id: string;
  public declare clearanceRequestId: string;
  public declare productName: string;
  public declare description?: string;
  public declare category?: string;
  public declare quantity: number;
  public declare unit: string;
  public declare value: number;
  public declare currency: string;
  public declare countryOfManufacture?: string;
  public declare hsCode?: string;
  public declare weight?: number;
  public declare volume?: number;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ClearanceItem.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clearanceRequestId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pcs',
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
    countryOfManufacture: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'China',
    },
    hsCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    volume: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'clearance_items',
    timestamps: true,
  }
);
