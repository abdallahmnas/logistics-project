import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// clearance

export type ClearanceStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENT_REVIEW'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'CLEARANCE_PROCESSING'
  | 'CUSTOMS_ASSESSMENT'
  | 'INSPECTION'
  | 'AWAITING_PAYMENT'
  | 'CUSTOMS_RELEASED'
  | 'DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ON_HOLD';

export interface ClearanceRequestAttributes {
  id: string;
  requestNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  shipmentType: string;
  originCountry: string;
  portOfEntry: string;
  shipmentStatus: string;
  shippingLine?: string | null;
  airline?: string | null;
  billOfLadingNumber?: string | null;
  airWaybillNumber?: string | null;
  containerNumber?: string | null;
  estimatedArrivalDate?: string | null;
  hasMissingShipmentInfo?: boolean;
  noShippingInfoProvided?: boolean;
  status: ClearanceStatus;
  deliveryPreference: string;
  recipientName?: string | null;
  recipientPhone?: string | null;
  deliveryAddress?: any;
  city?: string | null;
  state?: string | null;
  deliveryInstructions?: string | null;
  totalValueUsd?: number;
  totalProductsCount?: number;
  isConfirmedAccurate?: boolean;
  requiredActionNote?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceRequestCreationAttributes = Optional<
  ClearanceRequestAttributes,
  | 'id'
  | 'status'
  | 'originCountry'
  | 'shipmentStatus'
  | 'deliveryPreference'
  | 'totalValueUsd'
  | 'totalProductsCount'
  | 'isConfirmedAccurate'
  | 'hasMissingShipmentInfo'
  | 'noShippingInfoProvided'
  | 'requiredActionNote'
>;

export class ClearanceRequest
  extends Model<ClearanceRequestAttributes, ClearanceRequestCreationAttributes>
  implements ClearanceRequestAttributes {
  public declare id: string;
  public declare requestNumber: string;
  public declare customerId: string;
  public declare customerName?: string;
  public declare customerPhone?: string;
  public declare customerEmail?: string;
  public declare shipmentType: string;
  public declare originCountry: string;
  public declare portOfEntry: string;
  public declare shipmentStatus: string;
  public declare shippingLine?: string | null;
  public declare airline?: string | null;
  public declare billOfLadingNumber?: string | null;
  public declare airWaybillNumber?: string | null;
  public declare containerNumber?: string | null;
  public declare estimatedArrivalDate?: string | null;
  public declare hasMissingShipmentInfo?: boolean;
  public declare noShippingInfoProvided?: boolean;
  public declare status: ClearanceStatus;
  public declare deliveryPreference: string;
  public declare recipientName?: string | null;
  public declare recipientPhone?: string | null;
  public declare deliveryAddress?: any;
  public declare city?: string | null;
  public declare state?: string | null;
  public declare deliveryInstructions?: string | null;
  public declare totalValueUsd?: number;
  public declare totalProductsCount?: number;
  public declare isConfirmedAccurate?: boolean;
  public declare requiredActionNote?: string | null;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ClearanceRequest.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipmentType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Sea',
    },
    originCountry: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'China',
    },
    portOfEntry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shipmentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'In transit',
    },
    shippingLine: { type: DataTypes.STRING, allowNull: true },
    airline: { type: DataTypes.STRING, allowNull: true },
    billOfLadingNumber: { type: DataTypes.STRING, allowNull: true },
    airWaybillNumber: { type: DataTypes.STRING, allowNull: true },
    containerNumber: { type: DataTypes.STRING, allowNull: true },
    estimatedArrivalDate: { type: DataTypes.STRING, allowNull: true },
    hasMissingShipmentInfo: { type: DataTypes.BOOLEAN, defaultValue: false },
    noShippingInfoProvided: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'SUBMITTED',
    },
    deliveryPreference: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Deliver to me',
    },
    recipientName: { type: DataTypes.STRING, allowNull: true },
    recipientPhone: { type: DataTypes.STRING, allowNull: true },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('deliveryAddress');
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      },
      set(val: any) {
        if (val === null || val === undefined) {
          this.setDataValue('deliveryAddress', null);
        } else if (typeof val === 'object') {
          this.setDataValue('deliveryAddress', JSON.stringify(val));
          if (val.fullName) this.setDataValue('recipientName', val.fullName);
          if (val.phone) this.setDataValue('recipientPhone', val.phone);
          if (val.city) this.setDataValue('city', val.city);
          if (val.state) this.setDataValue('state', val.state);
          if (val.instructions) this.setDataValue('deliveryInstructions', val.instructions);
        } else {
          this.setDataValue('deliveryAddress', val);
        }
      },
    },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    deliveryInstructions: { type: DataTypes.TEXT, allowNull: true },
    totalValueUsd: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalProductsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    isConfirmedAccurate: { type: DataTypes.BOOLEAN, defaultValue: true },
    requiredActionNote: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: 'clearance_requests',
    timestamps: true,
  }
);
