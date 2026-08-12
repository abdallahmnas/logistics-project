import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ExchangeRateAttributes {
  id: string;
  buyRate: number;
  sellRate: number;
  platformRate: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ExchangeRateCreationAttributes = Optional<ExchangeRateAttributes, 'id' | 'isActive'>;

export class ExchangeRate extends Model<ExchangeRateAttributes, ExchangeRateCreationAttributes> implements ExchangeRateAttributes {
  public declare id: string;
  public declare buyRate: number;
  public declare sellRate: number;
  public declare platformRate: number;
  public declare effectiveFrom: Date;
  public declare effectiveTo?: Date;
  public declare isActive: boolean;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ExchangeRate.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    buyRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    sellRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    platformRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    effectiveTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'exchange_rates',
    timestamps: true,
  }
);
