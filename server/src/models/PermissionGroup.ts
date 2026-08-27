import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type PermissionMatrix = Record<string, Record<string, boolean>>;

export interface PermissionGroupAttributes {
  id: string;
  name: string;
  title?: string;
  description?: string;
  permissions?: PermissionMatrix;
  status?: 'active' | 'inactive';
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PermissionGroupCreationAttributes = Optional<PermissionGroupAttributes, 'id' | 'description' | 'isActive'>;

export class PermissionGroup extends Model<PermissionGroupAttributes, PermissionGroupCreationAttributes> implements PermissionGroupAttributes {
  public declare id: string;
  public declare name: string;
  public declare title?: string;
  public declare description?: string;
  public declare permissions?: PermissionMatrix;
  public declare status?: 'active' | 'inactive';
  public declare isActive: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

PermissionGroup.init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  permissions: { type: DataTypes.JSONB, allowNull: true, defaultValue: {} },
  status: { type: DataTypes.STRING, allowNull: true, defaultValue: 'active' },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { sequelize, tableName: 'permission_groups', timestamps: true });
