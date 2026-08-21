import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface SystemSettingsAttributes {
  id: string;
  // Receiving Account Details (Naira Escrow for NGN -> RMB)
  ngnEscrowBankName: string;
  ngnEscrowAccountNo: string;
  ngnEscrowAccountName: string;
  
  // Receiving Account Details (Yen/RMB for RMB -> NGN)
  rmbReceivingBankName: string;
  rmbReceivingAccountNo: string;
  rmbReceivingAccountName: string;
  rmbReceivingAlipay: string;
  rmbReceivingWechat: string;

  // Exchange Rates
  cnyExchangeRate: number;
  usdExchangeRate: number;

  // Freight Charges
  airFreightRatePerKg: number;
  seaFreightRatePerCbm: number;
  seaFreightRatePerKg: number;

  // Procurement Charges (Buy For Me)
  buyForMeFeePercent: number;
  buyForMeFixedFee: number;

  // Local Dispatch Fees
  deliveryMotorbikeBaseRate: number;
  deliveryMotorbikePerKm: number;
  deliverySedanBaseRate: number;
  deliverySedanPerKm: number;
  deliveryTruckBaseRate: number;
  deliveryTruckPerKm: number;

  // Wallet Operations
  walletFundingFeePercent: number;
  walletWithdrawalFlatFee: number;

  // Custom Shipping Corridors & Ports JSON
  customRoutes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type SystemSettingsCreationAttributes = Optional<SystemSettingsAttributes, 'id'>;

export class SystemSettings extends Model<SystemSettingsAttributes, SystemSettingsCreationAttributes> implements SystemSettingsAttributes {
  public declare id: string;
  public declare ngnEscrowBankName: string;
  public declare ngnEscrowAccountNo: string;
  public declare ngnEscrowAccountName: string;
  public declare rmbReceivingBankName: string;
  public declare rmbReceivingAccountNo: string;
  public declare rmbReceivingAccountName: string;
  public declare rmbReceivingAlipay: string;
  public declare rmbReceivingWechat: string;
  public declare cnyExchangeRate: number;
  public declare usdExchangeRate: number;
  public declare airFreightRatePerKg: number;
  public declare seaFreightRatePerCbm: number;
  public declare seaFreightRatePerKg: number;
  public declare buyForMeFeePercent: number;
  public declare buyForMeFixedFee: number;
  public declare deliveryMotorbikeBaseRate: number;
  public declare deliveryMotorbikePerKm: number;
  public declare deliverySedanBaseRate: number;
  public declare deliverySedanPerKm: number;
  public declare deliveryTruckBaseRate: number;
  public declare deliveryTruckPerKm: number;
  public declare walletFundingFeePercent: number;
  public declare walletWithdrawalFlatFee: number;
  public declare customRoutes?: string;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

SystemSettings.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: 'global_settings',
      primaryKey: true,
    },
    ngnEscrowBankName: {
      type: DataTypes.STRING,
      defaultValue: 'GTBank',
    },
    ngnEscrowAccountNo: {
      type: DataTypes.STRING,
      defaultValue: '0123456789',
    },
    ngnEscrowAccountName: {
      type: DataTypes.STRING,
      defaultValue: 'Hamza RMB Trading Escrow Ltd',
    },
    rmbReceivingBankName: {
      type: DataTypes.STRING,
      defaultValue: 'Industrial and Commercial Bank of China (ICBC)',
    },
    rmbReceivingAccountNo: {
      type: DataTypes.STRING,
      defaultValue: '6222021001008888888',
    },
    rmbReceivingAccountName: {
      type: DataTypes.STRING,
      defaultValue: 'Guangzhou Hamza Logistics Co., Ltd',
    },
    rmbReceivingAlipay: {
      type: DataTypes.STRING,
      defaultValue: 'hamza_rmb@alipay.com',
    },
    rmbReceivingWechat: {
      type: DataTypes.STRING,
      defaultValue: 'HamzaRMB_Pay',
    },
    cnyExchangeRate: {
      type: DataTypes.FLOAT,
      defaultValue: 215.0,
    },
    usdExchangeRate: {
      type: DataTypes.FLOAT,
      defaultValue: 1550.0,
    },
    airFreightRatePerKg: {
      type: DataTypes.FLOAT,
      defaultValue: 12500,
    },
    seaFreightRatePerCbm: {
      type: DataTypes.FLOAT,
      defaultValue: 450000,
    },
    seaFreightRatePerKg: {
      type: DataTypes.FLOAT,
      defaultValue: 3500,
    },
    buyForMeFeePercent: {
      type: DataTypes.FLOAT,
      defaultValue: 5.0,
    },
    buyForMeFixedFee: {
      type: DataTypes.FLOAT,
      defaultValue: 1000,
    },
    deliveryMotorbikeBaseRate: {
      type: DataTypes.FLOAT,
      defaultValue: 1500,
    },
    deliveryMotorbikePerKm: {
      type: DataTypes.FLOAT,
      defaultValue: 150,
    },
    deliverySedanBaseRate: {
      type: DataTypes.FLOAT,
      defaultValue: 3000,
    },
    deliverySedanPerKm: {
      type: DataTypes.FLOAT,
      defaultValue: 250,
    },
    deliveryTruckBaseRate: {
      type: DataTypes.FLOAT,
      defaultValue: 8000,
    },
    deliveryTruckPerKm: {
      type: DataTypes.FLOAT,
      defaultValue: 500,
    },
    walletFundingFeePercent: {
      type: DataTypes.FLOAT,
      defaultValue: 1.5,
    },
    walletWithdrawalFlatFee: {
      type: DataTypes.FLOAT,
      defaultValue: 500,
    },
    customRoutes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'system_settings',
    timestamps: true,
  }
);
