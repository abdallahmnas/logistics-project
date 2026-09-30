import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ClearanceDocumentAttributes {
  id: string;
  clearanceRequestId: string;
  documentType: string;
  fileName?: string;
  fileUrl?: string;
  status: string;
  note?: string | null;
  notes?: string | null;
  isNotAvailable?: boolean;
  isMissingNoted?: boolean;
  uploadedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceDocumentCreationAttributes = Optional<
  ClearanceDocumentAttributes,
  | 'id'
  | 'fileName'
  | 'fileUrl'
  | 'status'
  | 'note'
  | 'notes'
  | 'isNotAvailable'
  | 'isMissingNoted'
  | 'uploadedAt'
>;

export class ClearanceDocument
  extends Model<ClearanceDocumentAttributes, ClearanceDocumentCreationAttributes>
  implements ClearanceDocumentAttributes {
  public declare id: string;
  public declare clearanceRequestId: string;
  public declare documentType: string;
  public declare fileName?: string;
  public declare fileUrl?: string;
  public declare status: string;
  public declare note?: string | null;
  public declare notes?: string | null;
  public declare isNotAvailable?: boolean;
  public declare isMissingNoted?: boolean;
  public declare uploadedAt?: Date;
  public declare readonly createdAt: Date;
  public declare readonly updatedAt: Date;
}

ClearanceDocument.init(
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
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Uploaded',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isNotAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isMissingNoted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'clearance_documents',
    timestamps: true,
  }
);
