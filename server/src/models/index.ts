import { sequelize } from '../config/database';
import { User } from './User';
import { Wallet } from './Wallet';
import { Package } from './Package';
import { Consolidation } from './Consolidation';
import { Batch } from './Batch';
import { WalletTransaction } from './WalletTransaction';
import { ProcurementRequest } from './ProcurementRequest';
import { ExchangeRate } from './ExchangeRate';
import { ExchangeRequest } from './ExchangeRequest';
import { LocalDelivery } from './LocalDelivery';
import { Notification } from './Notification';
import { SupportTicket } from './SupportTicket';
import { TicketMessage } from './TicketMessage';

// Define Relationships
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

SupportTicket.hasMany(TicketMessage, { foreignKey: 'ticketId', as: 'messages' });
TicketMessage.belongsTo(SupportTicket, { foreignKey: 'ticketId', as: 'ticket' });

export {
  sequelize,
  User,
  Wallet,
  Package,
  Consolidation,
  Batch,
  WalletTransaction,
  ProcurementRequest,
  ExchangeRate,
  ExchangeRequest,
  LocalDelivery,
  Notification,
  SupportTicket,
  TicketMessage,
};
