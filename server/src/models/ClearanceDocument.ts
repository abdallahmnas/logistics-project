import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ClearanceDocumentAttributes {
  id: string;
  clearanceRequestId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: 'uploaded' | 'under_review' | 'accepted' | 'more_info_required';
  notes?: string;
  isMissingNoted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClearanceDocumentCreationAttributes = Optional<
  ClearanceDocumentAttributes,
  'id' | 'status' | 'notes' | 'isMissingNoted'
>;

export class ClearanceDocument
  extends Model<ClearanceDocumentAttributes, ClearanceDocumentCreationAttributes>
  implements ClearanceDocumentAttributes {
  public declare id: string;
  public declare clearanceRequestId: string;
  public declare documentType: string;
  public declare fileName: string;
  public declare fileUrl: string;
  public declare status: 'uploaded' | 'under_review' | 'accepted' | 'more_info_required';
  public declare notes?: string;
  public declare isMissingNoted?: boolean;
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
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'uploaded',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isMissingNoted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'clearance_documents',
    timestamps: true,
  }
);
