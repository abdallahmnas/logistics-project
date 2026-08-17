import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ActivityLogAttributes {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  module: 'auth' | 'shipments' | 'warehouse' | 'procurement' | 'exchange' | 'wallet' | 'staff' | 'settings';
  action: string;
  description: string;
  entityId?: string;
  metadata?: object;
  ipAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ActivityLogCreationAttributes = Optional<ActivityLogAttributes, 'id'>;

export class ActivityLog extends Model<ActivityLogAttributes, ActivityLogCreationAttributes> implements ActivityLogAttributes {
  public declare id: string;
  public declare userId: string;
  public declare userName: string;
  public declare userRole: string;
  public declare module: 'auth' | 'shipments' | 'warehouse' | 'procurement' | 'exchange' | 'wallet' | 'staff' | 'settings';
  public declare action: string;
  public declare description: string;
  public declare entityId?: string;
  public declare metadata?: object;
  public declare ipAddress?: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ActivityLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userRole: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    module: {
      type: DataTypes.ENUM('auth', 'shipments', 'warehouse', 'procurement', 'exchange', 'wallet', 'staff', 'settings'),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'activity_logs',
    timestamps: true,
  }
);
