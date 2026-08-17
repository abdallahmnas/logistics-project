import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProcurementRequestAttributes {
  id: string;
  customerId: string;
  customerName: string;
  productUrl: string;
  productPhotos?: string[];
  quantity: number;
  specifications: string;
  sizes?: string;
  colors?: string;
  variations?: string;
  notes?: string;
  status: 'submitted' | 'under_review' | 'quoted' | 'approved' | 'purchasing' | 'shipped_to_wh' | 'received_at_wh' | 'cancelled' | 'rejected';
  productCostRmb?: number;
  serviceFeeRmb?: number;
  totalCostRmb?: number;
  exchangeRateUsed?: number;
  totalCostNaira?: number;
  supplierName?: string;
  chineseTrackingNo?: string;
  linkedShipmentId?: string;
  submittedAt: Date;
  quotedAt?: Date;
  approvedAt?: Date;
  purchasedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProcurementRequestCreationAttributes = Optional<ProcurementRequestAttributes, 'id' | 'status' | 'submittedAt'>;

export class ProcurementRequest extends Model<ProcurementRequestAttributes, ProcurementRequestCreationAttributes> implements ProcurementRequestAttributes {
  public declare id: string;
  public declare customerId: string;
  public declare customerName: string;
  public declare productUrl: string;
  public declare productPhotos?: string[];
  public declare quantity: number;
  public declare specifications: string;
  public declare sizes?: string;
  public declare colors?: string;
  public declare variations?: string;
  public declare notes?: string;
  public declare status: 'submitted' | 'under_review' | 'quoted' | 'approved' | 'purchasing' | 'shipped_to_wh' | 'received_at_wh' | 'cancelled' | 'rejected';
  public declare productCostRmb?: number;
  public declare serviceFeeRmb?: number;
  public declare totalCostRmb?: number;
  public declare exchangeRateUsed?: number;
  public declare totalCostNaira?: number;
  public declare supplierName?: string;
  public declare chineseTrackingNo?: string;
  public declare linkedShipmentId?: string;
  public declare submittedAt: Date;
  public declare quotedAt?: Date;
  public declare approvedAt?: Date;
  public declare purchasedAt?: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ProcurementRequest.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productPhotos: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    specifications: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sizes: { type: DataTypes.STRING, allowNull: true },
    colors: { type: DataTypes.STRING, allowNull: true },
    variations: { type: DataTypes.STRING, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        'submitted',
        'under_review',
        'quoted',
        'approved',
        'purchasing',
        'shipped_to_wh',
        'received_at_wh',
        'cancelled',
        'rejected'
      ),
      defaultValue: 'submitted',
    },
    productCostRmb: { type: DataTypes.FLOAT, allowNull: true },
    serviceFeeRmb: { type: DataTypes.FLOAT, allowNull: true },
    totalCostRmb: { type: DataTypes.FLOAT, allowNull: true },
    exchangeRateUsed: { type: DataTypes.FLOAT, allowNull: true },
    totalCostNaira: { type: DataTypes.FLOAT, allowNull: true },
    supplierName: { type: DataTypes.STRING, allowNull: true },
    chineseTrackingNo: { type: DataTypes.STRING, allowNull: true },
    linkedShipmentId: { type: DataTypes.STRING, allowNull: true },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    quotedAt: { type: DataTypes.DATE, allowNull: true },
    approvedAt: { type: DataTypes.DATE, allowNull: true },
    purchasedAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'procurement_requests',
    timestamps: true,
  }
);
