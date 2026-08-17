import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TicketMessageAttributes {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  attachments?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type TicketMessageCreationAttributes = Optional<TicketMessageAttributes, 'id'>;

export class TicketMessage extends Model<TicketMessageAttributes, TicketMessageCreationAttributes> implements TicketMessageAttributes {
  public declare id: string;
  public declare ticketId: string;
  public declare senderId: string;
  public declare senderName: string;
  public declare senderRole: string;
  public declare message: string;
  public declare attachments?: string[];
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

TicketMessage.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    ticketId: { type: DataTypes.UUID, allowNull: false },
    senderId: { type: DataTypes.STRING, allowNull: false },
    senderName: { type: DataTypes.STRING, allowNull: false },
    senderRole: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    attachments: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  },
  { sequelize, tableName: 'ticket_messages', timestamps: true }
);
