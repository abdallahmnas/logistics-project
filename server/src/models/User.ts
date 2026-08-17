import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface UserAttributes {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'customer' | 'warehouse_cn' | 'warehouse_ng' | 'finance' | 'procurement' | 'driver';
  passwordHash?: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  profilePhoto?: string;
  permissionGroupId?: string;
  pushToken?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isVerified'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public declare id: string;
  public declare customerId: string;
  public declare firstName: string;
  public declare lastName: string;
  public declare email: string;
  public declare phone: string;
  public declare role: 'super_admin' | 'admin' | 'customer' | 'warehouse_cn' | 'warehouse_ng' | 'finance' | 'procurement' | 'driver';
  public declare passwordHash?: string;
  public declare isVerified: boolean;
  public declare otpCode?: string;
  public declare otpExpiry?: Date;
  public declare resetToken?: string;
  public declare resetTokenExpiry?: Date;
  public declare profilePhoto?: string;
  public declare permissionGroupId?: string;
  public declare isActive?: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'admin', 'customer', 'warehouse_cn', 'warehouse_ng', 'finance', 'procurement', 'driver'),
      defaultValue: 'customer',
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    otpCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permissionGroupId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    pushToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
