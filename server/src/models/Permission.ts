import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PermissionAttributes {
  id: string;
  permissionGroupId: string;
  entity: string;
  action: string;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

export type PermissionCreationAttributes = Optional<PermissionAttributes, 'id' | 'status'>;

export class Permission extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public declare id: string;
  public declare permissionGroupId: string;
  public declare entity: string;
  public declare action: string;
  public declare status: 'active' | 'inactive';
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    permissionGroupId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
  }
);
