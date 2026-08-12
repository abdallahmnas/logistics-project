import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SupportTicketAttributes {
  id: string;
  customerId: string;
  customerName: string;
  subject: string;
  category: 'shipment' | 'payment' | 'exchange' | 'procurement' | 'delivery' | 'account' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  referenceId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SupportTicketCreationAttributes = Optional<SupportTicketAttributes, 'id' | 'status' | 'priority'>;

export class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> implements SupportTicketAttributes {
  public declare id: string;
  public declare customerId: string;
  public declare customerName: string;
  public declare subject: string;
  public declare category: 'shipment' | 'payment' | 'exchange' | 'procurement' | 'delivery' | 'account' | 'other';
  public declare status: 'open' | 'in_progress' | 'resolved' | 'closed';
  public declare priority: 'low' | 'medium' | 'high' | 'urgent';
  public declare referenceId?: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

SupportTicket.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    customerId: { type: DataTypes.STRING, allowNull: false },
    customerName: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    category: {
      type: DataTypes.ENUM('shipment', 'payment', 'exchange', 'procurement', 'delivery', 'account', 'other'),
      defaultValue: 'other',
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    referenceId: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, tableName: 'support_tickets', timestamps: true }
);
