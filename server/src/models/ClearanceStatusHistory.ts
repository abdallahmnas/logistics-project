import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ClearanceStatusHistoryAttributes {
  id: string;
  clearanceRequestId: string;
  status: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceStatusHistoryCreationAttributes = Optional<
  ClearanceStatusHistoryAttributes,
  'id'
>;

export class ClearanceStatusHistory
  extends Model<ClearanceStatusHistoryAttributes, ClearanceStatusHistoryCreationAttributes>
  implements ClearanceStatusHistoryAttributes {
  public declare id: string;
  public declare clearanceRequestId: string;
  public declare status: string;
  public declare message: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ClearanceStatusHistory.init(
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'clearance_status_histories',
    timestamps: true,
  }
);
