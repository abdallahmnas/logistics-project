import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificationAttributes {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'shipment' | 'procurement' | 'exchange' | 'delivery' | 'wallet' | 'system' | 'support';
  isRead: boolean;
  referenceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'isRead'>;

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public declare id: string;
  public declare userId: string;
  public declare title: string;
  public declare message: string;
  public declare type: 'shipment' | 'procurement' | 'exchange' | 'delivery' | 'wallet' | 'system' | 'support';
  public declare isRead: boolean;
  public declare referenceId?: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Notification.init(
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'system',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    referenceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
  }
);
