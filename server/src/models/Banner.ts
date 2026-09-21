import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BannerAttributes {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  targetScreen?: string; // e.g. 'air_freight', 'sea_freight', 'procurement', 'exchange', 'wallet', 'delivery'
  displayOrder: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BannerCreationAttributes = Optional<
  BannerAttributes,
  'id' | 'subtitle' | 'linkUrl' | 'targetScreen' | 'displayOrder' | 'isActive'
>;

export class Banner extends Model<BannerAttributes, BannerCreationAttributes> implements BannerAttributes {
  public declare id: string;
  public declare title: string;
  public declare subtitle?: string;
  public declare imageUrl: string;
  public declare linkUrl?: string;
  public declare targetScreen?: string;
  public declare displayOrder: number;
  public declare isActive: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Banner.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    linkUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetScreen: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'home',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'banners',
    timestamps: true,
  }
);
