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
import { PermissionGroup } from './PermissionGroup';
import { Permission } from './Permission';
import { ActivityLog } from './ActivityLog';
import { Facility } from './Facility';
import { SavedAccount } from './SavedAccount';
import { SystemSettings } from './SystemSettings';
import { WalletDeposit } from './WalletDeposit';

// Define Relationships
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(WalletDeposit, { foreignKey: 'userId', as: 'walletDeposits' });
WalletDeposit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(SavedAccount, { foreignKey: 'userId', as: 'savedAccounts' });
SavedAccount.belongsTo(User, { foreignKey: 'userId', as: 'user' });

SupportTicket.hasMany(TicketMessage, { foreignKey: 'ticketId', as: 'messages' });
TicketMessage.belongsTo(SupportTicket, { foreignKey: 'ticketId', as: 'ticket' });

PermissionGroup.hasMany(User, { foreignKey: 'permissionGroupId', as: 'members' });
User.belongsTo(PermissionGroup, { foreignKey: 'permissionGroupId', as: 'permissionGroup' });

PermissionGroup.hasMany(Permission, { foreignKey: 'permissionGroupId', as: 'permissionRules' });
Permission.belongsTo(PermissionGroup, { foreignKey: 'permissionGroupId', as: 'group' });

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
  PermissionGroup,
  Permission,
  ActivityLog,
  Facility,
  SavedAccount,
  SystemSettings,
  WalletDeposit,
};
