import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ClearanceChargeAttributes {
  id: string;
  clearanceRequestId: string;
  category: 'customs_duty' | 'service_fee' | 'delivery_fee' | 'terminal_handling' | 'documentation' | 'other';
  description: string;
  amount: number;
  currency: string;
  isConfirmed: boolean;
  status: 'pending' | 'paid' | 'waived';
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceChargeCreationAttributes = Optional<
  ClearanceChargeAttributes,
  'id' | 'currency' | 'isConfirmed' | 'status'
>;

export class ClearanceCharge
  extends Model<ClearanceChargeAttributes, ClearanceChargeCreationAttributes>
  implements ClearanceChargeAttributes {
  public declare id: string;
  public declare clearanceRequestId: string;
  public declare category: 'customs_duty' | 'service_fee' | 'delivery_fee' | 'terminal_handling' | 'documentation' | 'other';
  public declare description: string;
  public declare amount: number;
  public declare currency: string;
  public declare isConfirmed: boolean;
  public declare status: 'pending' | 'paid' | 'waived';
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ClearanceCharge.init(
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'service_fee',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'NGN',
    },
    isConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'clearance_charges',
    timestamps: true,
  }
);
