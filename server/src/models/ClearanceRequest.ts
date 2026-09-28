import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

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
  shipmentType: 'sea' | 'air' | 'land';
  originCountry: string;
  portOfEntry: string;
  shipmentStatus: 'not_shipped' | 'in_transit' | 'arrived_ng' | 'at_terminal' | 'arrived_uncleared';
  shippingLine?: string;
  airline?: string;
  billOfLadingNumber?: string;
  airWaybillNumber?: string;
  containerNumber?: string;
  estimatedArrivalDate?: string;
  noShippingInfoProvided?: boolean;
  status: ClearanceStatus;
  deliveryPreference: 'deliver_to_me' | 'self_pickup';
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  city?: string;
  state?: string;
  deliveryInstructions?: string;
  totalValueUsd?: number;
  totalProductsCount?: number;
  isConfirmedAccurate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceRequestCreationAttributes = Optional<
  ClearanceRequestAttributes,
  'id' | 'status' | 'originCountry' | 'shipmentStatus' | 'deliveryPreference' | 'totalValueUsd' | 'totalProductsCount' | 'isConfirmedAccurate'
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
  public declare shipmentType: 'sea' | 'air' | 'land';
  public declare originCountry: string;
  public declare portOfEntry: string;
  public declare shipmentStatus: 'not_shipped' | 'in_transit' | 'arrived_ng' | 'at_terminal' | 'arrived_uncleared';
  public declare shippingLine?: string;
  public declare airline?: string;
  public declare billOfLadingNumber?: string;
  public declare airWaybillNumber?: string;
  public declare containerNumber?: string;
  public declare estimatedArrivalDate?: string;
  public declare noShippingInfoProvided?: boolean;
  public declare status: ClearanceStatus;
  public declare deliveryPreference: 'deliver_to_me' | 'self_pickup';
  public declare recipientName?: string;
  public declare recipientPhone?: string;
  public declare deliveryAddress?: string;
  public declare city?: string;
  public declare state?: string;
  public declare deliveryInstructions?: string;
  public declare totalValueUsd?: number;
  public declare totalProductsCount?: number;
  public declare isConfirmedAccurate?: boolean;
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
      defaultValue: 'sea',
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
      defaultValue: 'in_transit',
    },
    shippingLine: { type: DataTypes.STRING, allowNull: true },
    airline: { type: DataTypes.STRING, allowNull: true },
    billOfLadingNumber: { type: DataTypes.STRING, allowNull: true },
    airWaybillNumber: { type: DataTypes.STRING, allowNull: true },
    containerNumber: { type: DataTypes.STRING, allowNull: true },
    estimatedArrivalDate: { type: DataTypes.STRING, allowNull: true },
    noShippingInfoProvided: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    deliveryPreference: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'deliver_to_me',
    },
    recipientName: { type: DataTypes.STRING, allowNull: true },
    recipientPhone: { type: DataTypes.STRING, allowNull: true },
    deliveryAddress: { type: DataTypes.TEXT, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    deliveryInstructions: { type: DataTypes.TEXT, allowNull: true },
    totalValueUsd: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalProductsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    isConfirmedAccurate: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    sequelize,
    tableName: 'clearance_requests',
    timestamps: true,
  }
);
