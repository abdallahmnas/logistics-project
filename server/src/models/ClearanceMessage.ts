import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ClearanceMessageAttributes {
  id: string;
  clearanceRequestId: string;
  senderId?: string;
  senderName: string;
  senderRole: 'customer' | 'system' | 'support';
  message: string;
  attachmentUrl?: string;
  isSystemMessage: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceMessageCreationAttributes = Optional<
  ClearanceMessageAttributes,
  'id' | 'senderRole' | 'isSystemMessage'
>;

export class ClearanceMessage
  extends Model<ClearanceMessageAttributes, ClearanceMessageCreationAttributes>
  implements ClearanceMessageAttributes {
  public declare id: string;
  public declare clearanceRequestId: string;
  public declare senderId?: string;
  public declare senderName: string;
  public declare senderRole: 'customer' | 'system' | 'support';
  public declare message: string;
  public declare attachmentUrl?: string;
  public declare isSystemMessage: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ClearanceMessage.init(
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
    senderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderRole: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'customer',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isSystemMessage: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'clearance_messages',
    timestamps: true,
  }
);
