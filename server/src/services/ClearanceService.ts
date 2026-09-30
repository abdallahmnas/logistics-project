import {
  ClearanceRequest,
  ClearanceItem,
  ClearanceDocument,
  ClearanceCharge,
  ClearanceMessage,
  ClearanceStatusHistory,
  type ClearanceStatus,
  User,
  Wallet,
  WalletTransaction,
  Notification,
} from '../models';
import { sequelize } from '../config/database';
import { Op } from 'sequelize';
import { SettingsService } from './SettingsService';

export class ClearanceService {
  /**
   * Helper to generate unique Request Number e.g. CLR-2026-104928
   */
  private static generateRequestNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CLR-${year}-${random}`;
  }

  /**
   * Formats ClearanceRequest to sync perfectly with mobile API specification
   */
  public static formatClearanceResponse(request: any) {
    if (!request) return null;
    const reqObj = request.toJSON ? request.toJSON() : { ...request };

    // Format delivery address
    const isSelfPickup =
      reqObj.deliveryPreference === "I'll arrange pickup/delivery myself" ||
      reqObj.deliveryPreference === 'self_pickup' ||
      reqObj.deliveryPreference === 'Self Pickup';

    let deliveryAddressObj: any = null;
    if (!isSelfPickup) {
      if (reqObj.deliveryAddress && typeof reqObj.deliveryAddress === 'object') {
        deliveryAddressObj = reqObj.deliveryAddress;
      } else if (typeof reqObj.deliveryAddress === 'string') {
        try {
          deliveryAddressObj = JSON.parse(reqObj.deliveryAddress);
        } catch {
          deliveryAddressObj = {
            fullName: reqObj.recipientName || reqObj.customerName || '',
            phone: reqObj.recipientPhone || reqObj.customerPhone || '',
            address: reqObj.deliveryAddress,
            city: reqObj.city || '',
            state: reqObj.state || '',
            instructions: reqObj.deliveryInstructions || '',
          };
        }
      } else if (reqObj.recipientName || reqObj.city) {
        deliveryAddressObj = {
          fullName: reqObj.recipientName || reqObj.customerName || '',
          phone: reqObj.recipientPhone || reqObj.customerPhone || '',
          address: '',
          city: reqObj.city || '',
          state: reqObj.state || '',
          instructions: reqObj.deliveryInstructions || '',
        };
      }
    }

    // Format items
    const items = Array.isArray(reqObj.items)
      ? reqObj.items.map((it: any) => ({
        id: it.id,
        clearanceRequestId: it.clearanceRequestId || reqObj.id,
        productName: it.productName || 'Imported Goods',
        description: it.description || '',
        category: it.category || 'General Cargo',
        quantity: Number(it.quantity) || 1,
        unit: it.unit || 'pieces',
        purchaseValue: Number(it.purchaseValue ?? it.value ?? 0),
        currency: it.currency || 'USD',
        countryOfManufacture: it.countryOfManufacture || 'China',
        weight: it.weight != null ? Number(it.weight) : null,
        volume: it.volume != null ? Number(it.volume) : null,
        hsCode: it.hsCode || null,
      }))
      : [];

    // Format documents
    const documents = Array.isArray(reqObj.documents)
      ? reqObj.documents.map((doc: any) => ({
        id: doc.id,
        clearanceRequestId: doc.clearanceRequestId || reqObj.id,
        documentType: doc.documentType || 'Other Document',
        fileName: doc.fileName || '',
        fileUrl: doc.fileUrl || '',
        status: doc.status || (doc.isNotAvailable ? 'Not Available' : 'Uploaded'),
        uploadedAt: (doc.uploadedAt || doc.createdAt || new Date()).toISOString
          ? (doc.uploadedAt || doc.createdAt).toISOString()
          : doc.uploadedAt || doc.createdAt,
        isNotAvailable: Boolean(doc.isNotAvailable ?? doc.isMissingNoted ?? false),
        note: doc.note || doc.notes || null,
      }))
      : [];

    const hasMissing = Boolean(reqObj.hasMissingShipmentInfo ?? reqObj.noShippingInfoProvided ?? false);

    // Normalize shipmentType casing
    let shipmentType = reqObj.shipmentType || 'Sea';
    if (shipmentType.toLowerCase() === 'sea') shipmentType = 'Sea';
    else if (shipmentType.toLowerCase() === 'air') shipmentType = 'Air';
    else if (shipmentType.toLowerCase() === 'land') shipmentType = 'Land';

    // Normalize delivery preference
    let deliveryPreference = reqObj.deliveryPreference || 'Deliver to me';
    if (deliveryPreference === 'deliver_to_me') deliveryPreference = 'Deliver to me';
    else if (deliveryPreference === 'self_pickup') deliveryPreference = "I'll arrange pickup/delivery myself";

    return {
      id: reqObj.id,
      requestNumber: reqObj.requestNumber,
      customerId: reqObj.customerId,
      shipmentType,
      originCountry: reqObj.originCountry || 'China',
      portOfEntry: reqObj.portOfEntry || '',
      shipmentStatus: reqObj.shipmentStatus || 'In transit',
      shippingLine: reqObj.shippingLine || null,
      airline: reqObj.airline || null,
      billOfLadingNumber: reqObj.billOfLadingNumber || null,
      airWaybillNumber: reqObj.airWaybillNumber || null,
      containerNumber: reqObj.containerNumber || null,
      estimatedArrivalDate: reqObj.estimatedArrivalDate || null,
      hasMissingShipmentInfo: hasMissing,
      status: reqObj.status,
      deliveryPreference,
      deliveryAddress: deliveryAddressObj,
      items,
      documents,
      charges: reqObj.charges || [],
      payments: reqObj.payments || [],
      messages: reqObj.messages || [],
      statusHistory: reqObj.history || reqObj.statusHistory || [],
      requiredActionNote: reqObj.requiredActionNote || null,
      totalValueUsd: reqObj.totalValueUsd || 0,
      totalProductsCount: reqObj.totalProductsCount || items.length,
      customerName: reqObj.customerName || null,
      customerPhone: reqObj.customerPhone || null,
      customerEmail: reqObj.customerEmail || null,
      createdAt: reqObj.createdAt ? new Date(reqObj.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: reqObj.updatedAt ? new Date(reqObj.updatedAt).toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Create a new Customs Clearance Request (Draft or Submitted)
  */
  public static async createClearanceRequest(customerId: string, payload: any) {
    const user = await User.findByPk(customerId);
    if (!user) throw new Error('Customer account not found');

    const transaction = await sequelize.transaction();

    try {
      const isDraft = payload.isDraft === true || payload.status === 'DRAFT';
      const status: ClearanceStatus = isDraft ? 'DRAFT' : 'SUBMITTED';

      let totalValueUsd = 0;
      if (Array.isArray(payload.items)) {
        totalValueUsd = payload.items.reduce(
          (sum: number, item: any) =>
            sum + (Number(item.purchaseValue ?? item.value || 0) * (Number(item.quantity) || 1)),
          0
        );
      }

      const requestNumber = payload.requestNumber && String(payload.requestNumber).trim()
        ? payload.requestNumber.trim()
        : this.generateRequestNumber();

      const hasMissingShipmentInfo = Boolean(
        payload.hasMissingShipmentInfo ?? payload.noShippingInfoProvided ?? false
      );

      // Normalize shipment type
      let shipmentType = payload.shipmentType || 'Sea';
      if (shipmentType.toLowerCase() === 'sea') shipmentType = 'Sea';
      else if (shipmentType.toLowerCase() === 'air') shipmentType = 'Air';
      else if (shipmentType.toLowerCase() === 'land') shipmentType = 'Land';

      // Normalize delivery preference
      let deliveryPreference = payload.deliveryPreference || 'Deliver to me';
      if (deliveryPreference === 'deliver_to_me') deliveryPreference = 'Deliver to me';
      else if (deliveryPreference === 'self_pickup') deliveryPreference = "I'll arrange pickup/delivery myself";

      const isSelfPickup = deliveryPreference === "I'll arrange pickup/delivery myself";

      // Parse deliveryAddress
      let deliveryAddressData: any = null;
      let recipientName = `${user.firstName} ${user.lastName}`.trim();
      let recipientPhone = user.phone || '';
      let city = 'Lagos';
      let state = 'Lagos State';
      let deliveryInstructions = '';

      if (!isSelfPickup) {
        if (payload.deliveryAddress && typeof payload.deliveryAddress === 'object') {
          deliveryAddressData = payload.deliveryAddress;
          recipientName = payload.deliveryAddress.fullName || recipientName;
          recipientPhone = payload.deliveryAddress.phone || recipientPhone;
          city = payload.deliveryAddress.city || city;
          state = payload.deliveryAddress.state || state;
          deliveryInstructions = payload.deliveryAddress.instructions || '';
        } else if (typeof payload.deliveryAddress === 'string') {
          try {
            deliveryAddressData = JSON.parse(payload.deliveryAddress);
          } catch {
            deliveryAddressData = {
              fullName: payload.recipientName || recipientName,
              phone: payload.recipientPhone || recipientPhone,
              address: payload.deliveryAddress,
              city: payload.city || city,
              state: payload.state || state,
              instructions: payload.deliveryInstructions || '',
            };
          }
        }
      }

      const clearanceRequest = await ClearanceRequest.create(
        {
          id: payload.id || undefined,
          requestNumber,
          customerId,
          customerName: `${user.firstName} ${user.lastName}`.trim(),
          customerPhone: user.phone,
          customerEmail: user.email,
          shipmentType,
          originCountry: payload.originCountry || 'China',
          portOfEntry: payload.portOfEntry || 'Apapa Port',
          shipmentStatus: payload.shipmentStatus || 'In transit',
          shippingLine: payload.shippingLine || null,
          airline: payload.airline || null,
          billOfLadingNumber: payload.billOfLadingNumber || null,
          airWaybillNumber: payload.airWaybillNumber || null,
          containerNumber: payload.containerNumber || null,
          estimatedArrivalDate: payload.estimatedArrivalDate || null,
          hasMissingShipmentInfo,
          noShippingInfoProvided: hasMissingShipmentInfo,
          status,
          deliveryPreference,
          recipientName: isSelfPickup ? null : recipientName,
          recipientPhone: isSelfPickup ? null : recipientPhone,
          deliveryAddress: isSelfPickup ? null : deliveryAddressData,
          city: isSelfPickup ? null : city,
          state: isSelfPickup ? null : state,
          deliveryInstructions: isSelfPickup ? null : deliveryInstructions,
          totalValueUsd,
          totalProductsCount: Array.isArray(payload.items) ? payload.items.length : 0,
          isConfirmedAccurate: payload.isConfirmedAccurate ?? true,
          requiredActionNote: payload.requiredActionNote || null,
        },
        { transaction }
      );

      // Create Items
      if (Array.isArray(payload.items) && payload.items.length > 0) {
        const itemRecords = payload.items.map((it: any) => {
          const val = Number(it.purchaseValue ?? it.value ?? 0);
          return {
            id: it.id || undefined,
            clearanceRequestId: clearanceRequest.id,
            productName: it.productName || 'Imported Goods',
            description: it.description || '',
            category: it.category || 'General Cargo',
            quantity: Number(it.quantity) || 1,
            unit: it.unit || 'pieces',
            purchaseValue: val,
            value: val,
            currency: it.currency || 'USD',
            countryOfManufacture: it.countryOfManufacture || 'China',
            hsCode: it.hsCode || null,
            weight: it.weight != null ? Number(it.weight) : null,
            volume: it.volume != null ? Number(it.volume) : null,
          };
        });
        await ClearanceItem.bulkCreate(itemRecords, { transaction });
      }

      // Create Documents
      if (Array.isArray(payload.documents) && payload.documents.length > 0) {
        const docRecords = payload.documents.map((doc: any) => {
          const isNotAvailable = Boolean(doc.isNotAvailable ?? doc.isMissingNoted ?? false);
          return {
            id: doc.id || undefined,
            clearanceRequestId: clearanceRequest.id,
            documentType: doc.documentType || 'Commercial Invoice',
            fileName: doc.fileName ?? '',
            fileUrl: doc.fileUrl ?? '',
            status: doc.status || (isNotAvailable ? 'Not Available' : 'Uploaded'),
            isNotAvailable,
            isMissingNoted: isNotAvailable,
            note: doc.note || doc.notes || null,
            notes: doc.note || doc.notes || null,
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
          };
        });
        await ClearanceDocument.bulkCreate(docRecords, { transaction });
      }

      // Create initial status history entry
      const initialMessage = isDraft
        ? 'Customs clearance request draft saved.'
        : 'Your customs clearance request has been submitted and received.';
      await ClearanceStatusHistory.create(
        {
          clearanceRequestId: clearanceRequest.id,
          status,
          message: initialMessage,
        },
        { transaction }
      );

      // Create initial system message & debit clearance fee
      if (!isDraft) {
        // Fetch clearance request fee configured in Admin Settings
        const settings = await SettingsService.getSettings();
        const clearanceFee = Number(settings.customsClearanceFee ?? 35000);

        if (clearanceFee > 0) {
          // Find customer's wallet
          let wallet = await Wallet.findOne({ where: { userId: user.id }, transaction });
          if (!wallet) {
            wallet = await Wallet.findOne({ where: { userId: customerId }, transaction });
          }

          if (!wallet || Number(wallet.balance) < clearanceFee) {
            const currentBal = Number(wallet?.balance || 0);
            throw new Error(
              `Insufficient wallet balance to submit customs clearance request. A clearance fee of ₦${clearanceFee.toLocaleString()} is required, but your available balance is ₦${currentBal.toLocaleString()}. Please fund your wallet and retry.`
            );
          }

          // Debit wallet
          const newBalance = Number(wallet.balance) - clearanceFee;
          const newAvailable = Math.max(0, Number(wallet.availableBalance) - clearanceFee);
          wallet.balance = newBalance;
          wallet.availableBalance = newAvailable;
          await wallet.save({ transaction });

          // Create Wallet Transaction linking to the user
          await WalletTransaction.create(
            {
              userId: user.id,
              customerId: user.customerId,
              walletId: wallet.id,
              type: 'debit',
              category: 'clearance_fee',
              amount: clearanceFee,
              currency: 'NGN',
              balanceAfter: newBalance,
              description: `Customs clearance request fee debited (${requestNumber})`,
              referenceId: clearanceRequest.id,
              reference: `CLR-REQ-${requestNumber}-${Date.now()}`,
              status: 'completed',
            },
            { transaction }
          );

          // Add paid clearance charge record
          await ClearanceCharge.create(
            {
              clearanceRequestId: clearanceRequest.id,
              category: 'service_fee',
              description: 'Customs Clearance Request & Submission Fee',
              amount: clearanceFee,
              currency: 'NGN',
              isConfirmed: true,
              status: 'paid',
              paidAt: new Date(),
            },
            { transaction }
          );
        }

        await ClearanceMessage.create(
          {
            clearanceRequestId: clearanceRequest.id,
            senderName: 'System Bot',
            senderRole: 'system',
            message: `Your clearance request ${requestNumber} was submitted successfully.${clearanceFee > 0
                ? ` The clearance fee of ₦${clearanceFee.toLocaleString()} has been debited from your wallet.`
                : ''
              } Our customs documentation team will review your uploaded files and provide updates here.`,
            isSystemMessage: true,
          },
          { transaction }
        );

        if (!isSelfPickup) {
          await ClearanceCharge.create(
            {
              clearanceRequestId: clearanceRequest.id,
              category: 'delivery_fee',
              description: 'Local Doorstep Delivery Fee (Estimated)',
              amount: 15000,
              currency: 'NGN',
              isConfirmed: false,
              status: 'pending',
            },
            { transaction }
          );
        }

        // Create In-App Notification
        await Notification.create(
          {
            userId: customerId,
            title: 'Customs Clearance Submitted',
            message: `Request ${requestNumber} has been received and is entering document review.`,
            type: 'clearance',
            isRead: false,
            referenceId: clearanceRequest.id,
          },
          { transaction }
        );
      }

      await transaction.commit();

      return this.getClearanceRequestById(clearanceRequest.id, customerId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update an existing draft clearance request or edit before submission
   */
  public static async updateClearanceRequest(requestId: string, customerId: string, payload: any) {
    const request = await ClearanceRequest.findOne({
      where: { id: requestId, customerId },
    });
    if (!request) throw new Error('Clearance request not found');

    if (
      request.status !== 'DRAFT' &&
      request.status !== 'SUBMITTED' &&
      request.status !== 'ADDITIONAL_INFORMATION_REQUIRED'
    ) {
      throw new Error('This request cannot be modified in its current status');
    }

    const transaction = await sequelize.transaction();

    try {
      const isSubmitting = payload.submit === true || payload.isDraft === false;

      let totalValueUsd = request.totalValueUsd;
      if (Array.isArray(payload.items)) {
        totalValueUsd = payload.items.reduce(
          (sum: number, item: any) =>
            sum + (Number(item.purchaseValue ?? item.value || 0) * (Number(item.quantity) || 1)),
          0
        );
      }

      const updatedStatus: ClearanceStatus = isSubmitting
        ? request.status === 'ADDITIONAL_INFORMATION_REQUIRED'
          ? 'DOCUMENT_REVIEW'
          : 'SUBMITTED'
        : request.status;

      const hasMissingShipmentInfo =
        payload.hasMissingShipmentInfo !== undefined
          ? payload.hasMissingShipmentInfo
          : request.hasMissingShipmentInfo;

      let deliveryAddressData = request.deliveryAddress;
      if (payload.deliveryAddress !== undefined) {
        deliveryAddressData = payload.deliveryAddress;
      }

      await request.update(
        {
          shipmentType: payload.shipmentType || request.shipmentType,
          originCountry: payload.originCountry || request.originCountry,
          portOfEntry: payload.portOfEntry || request.portOfEntry,
          shipmentStatus: payload.shipmentStatus || request.shipmentStatus,
          shippingLine: payload.shippingLine ?? request.shippingLine,
          airline: payload.airline ?? request.airline,
          billOfLadingNumber: payload.billOfLadingNumber ?? request.billOfLadingNumber,
          airWaybillNumber: payload.airWaybillNumber ?? request.airWaybillNumber,
          containerNumber: payload.containerNumber ?? request.containerNumber,
          estimatedArrivalDate: payload.estimatedArrivalDate ?? request.estimatedArrivalDate,
          hasMissingShipmentInfo,
          noShippingInfoProvided: hasMissingShipmentInfo,
          status: updatedStatus,
          deliveryPreference: payload.deliveryPreference || request.deliveryPreference,
          recipientName: payload.recipientName ?? request.recipientName,
          recipientPhone: payload.recipientPhone ?? request.recipientPhone,
          deliveryAddress: deliveryAddressData,
          city: payload.city ?? request.city,
          state: payload.state ?? request.state,
          deliveryInstructions: payload.deliveryInstructions ?? request.deliveryInstructions,
          totalValueUsd,
          totalProductsCount: Array.isArray(payload.items) ? payload.items.length : request.totalProductsCount,
          isConfirmedAccurate: payload.isConfirmedAccurate ?? request.isConfirmedAccurate,
          requiredActionNote: payload.requiredActionNote ?? request.requiredActionNote,
        },
        { transaction }
      );

      // Replace items if provided
      if (Array.isArray(payload.items)) {
        await ClearanceItem.destroy({ where: { clearanceRequestId: request.id }, transaction });
        const itemRecords = payload.items.map((it: any) => {
          const val = Number(it.purchaseValue ?? it.value ?? 0);
          return {
            id: it.id || undefined,
            clearanceRequestId: request.id,
            productName: it.productName || 'Imported Goods',
            description: it.description || '',
            category: it.category || 'General Cargo',
            quantity: Number(it.quantity) || 1,
            unit: it.unit || 'pieces',
            purchaseValue: val,
            value: val,
            currency: it.currency || 'USD',
            countryOfManufacture: it.countryOfManufacture || 'China',
            hsCode: it.hsCode || null,
            weight: it.weight != null ? Number(it.weight) : null,
            volume: it.volume != null ? Number(it.volume) : null,
          };
        });
        await ClearanceItem.bulkCreate(itemRecords, { transaction });
      }

      // Add new documents if provided
      if (Array.isArray(payload.documents) && payload.documents.length > 0) {
        const docRecords = payload.documents.map((doc: any) => {
          const isNotAvailable = Boolean(doc.isNotAvailable ?? doc.isMissingNoted ?? false);
          return {
            id: doc.id || undefined,
            clearanceRequestId: request.id,
            documentType: doc.documentType || 'Commercial Invoice',
            fileName: doc.fileName ?? '',
            fileUrl: doc.fileUrl ?? '',
            status: doc.status || (isNotAvailable ? 'Not Available' : 'Uploaded'),
            isNotAvailable,
            isMissingNoted: isNotAvailable,
            note: doc.note || doc.notes || null,
            notes: doc.note || doc.notes || null,
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
          };
        });
        await ClearanceDocument.bulkCreate(docRecords, { transaction });
      }

      if (isSubmitting && request.status === 'DRAFT') {
        await ClearanceStatusHistory.create(
          {
            clearanceRequestId: request.id,
            status: 'SUBMITTED',
            message: 'Your clearance request has been submitted for document review.',
          },
          { transaction }
        );

        await ClearanceMessage.create(
          {
            clearanceRequestId: request.id,
            senderName: 'System Bot',
            senderRole: 'system',
            message: `Clearance request ${request.requestNumber} has been officially submitted.`,
            isSystemMessage: true,
          },
          { transaction }
        );
      }

      await transaction.commit();
      return this.getClearanceRequestById(request.id, customerId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get all clearance requests for a customer
   */
  public static async getCustomerClearanceRequests(
    customerId: string,
    filter?: { status?: string; search?: string }
  ) {
    const where: any = { customerId };

    if (filter?.status && filter.status !== 'ALL') {
      if (filter.status === 'ACTIVE') {
        where.status = [
          'SUBMITTED',
          'DOCUMENT_REVIEW',
          'ADDITIONAL_INFORMATION_REQUIRED',
          'CLEARANCE_PROCESSING',
          'CUSTOMS_ASSESSMENT',
          'INSPECTION',
          'AWAITING_PAYMENT',
          'CUSTOMS_RELEASED',
          'DELIVERY',
          'ON_HOLD',
        ];
      } else if (filter.status === 'COMPLETED') {
        where.status = 'COMPLETED';
      } else if (filter.status === 'CANCELLED') {
        where.status = 'CANCELLED';
      } else {
        where.status = filter.status;
      }
    }

    if (filter?.search && filter.search.trim()) {
      const q = `%${filter.search.trim()}%`;
      where[Op.or] = [
        { requestNumber: { [Op.iLike]: q } },
        { billOfLadingNumber: { [Op.iLike]: q } },
        { airWaybillNumber: { [Op.iLike]: q } },
        { containerNumber: { [Op.iLike]: q } },
        { portOfEntry: { [Op.iLike]: q } },
      ];
    }

    const requests = await ClearanceRequest.findAll({
      where,
      include: [
        { model: ClearanceItem, as: 'items' },
        { model: ClearanceDocument, as: 'documents' },
        { model: ClearanceCharge, as: 'charges' },
        { model: ClearanceStatusHistory, as: 'history', order: [['createdAt', 'ASC']] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return requests.map((r) => this.formatClearanceResponse(r));
  }

  /**
   * Get all clearance requests for Admin Dashboard & Clearance Agents
   */
  public static async getAllClearanceRequests(filter?: {
    status?: string;
    search?: string;
    shipmentType?: string;
  }) {
    const where: any = {};

    if (filter?.status && filter.status !== 'ALL') {
      if (filter.status === 'ACTIVE') {
        where.status = [
          'SUBMITTED',
          'DOCUMENT_REVIEW',
          'ADDITIONAL_INFORMATION_REQUIRED',
          'CLEARANCE_PROCESSING',
          'CUSTOMS_ASSESSMENT',
          'INSPECTION',
          'AWAITING_PAYMENT',
          'CUSTOMS_RELEASED',
          'DELIVERY',
          'ON_HOLD',
        ];
      } else if (filter.status === 'COMPLETED') {
        where.status = 'COMPLETED';
      } else if (filter.status === 'CANCELLED') {
        where.status = 'CANCELLED';
      } else {
        where.status = filter.status;
      }
    }

    if (filter?.shipmentType && filter.shipmentType !== 'ALL') {
      where.shipmentType = { [Op.iLike]: filter.shipmentType };
    }

    if (filter?.search && filter.search.trim()) {
      const q = `%${filter.search.trim()}%`;
      where[Op.or] = [
        { requestNumber: { [Op.iLike]: q } },
        { customerName: { [Op.iLike]: q } },
        { customerId: { [Op.iLike]: q } },
        { customerEmail: { [Op.iLike]: q } },
        { customerPhone: { [Op.iLike]: q } },
        { billOfLadingNumber: { [Op.iLike]: q } },
        { airWaybillNumber: { [Op.iLike]: q } },
        { containerNumber: { [Op.iLike]: q } },
        { portOfEntry: { [Op.iLike]: q } },
      ];
    }

    const requests = await ClearanceRequest.findAll({
      where,
      include: [
        { model: ClearanceItem, as: 'items' },
        { model: ClearanceDocument, as: 'documents' },
        { model: ClearanceCharge, as: 'charges' },
        { model: ClearanceMessage, as: 'messages', order: [['createdAt', 'ASC']] },
        { model: ClearanceStatusHistory, as: 'history', order: [['createdAt', 'ASC']] },
      ],
      order: [['createdAt', 'DESC']],
    });

    return requests.map((r) => this.formatClearanceResponse(r));
  }

  /**
   * Get single clearance request details by ID or Request Number
   */
  public static async getClearanceRequestById(requestIdOrNumber: string, customerId?: string) {
    const where: any = {
      [Op.or]: [{ id: requestIdOrNumber }, { requestNumber: requestIdOrNumber }],
    };

    if (customerId) {
      where.customerId = customerId;
    }

    const request = await ClearanceRequest.findOne({
      where,
      include: [
        { model: ClearanceItem, as: 'items' },
        { model: ClearanceDocument, as: 'documents' },
        { model: ClearanceCharge, as: 'charges' },
        { model: ClearanceMessage, as: 'messages', order: [['createdAt', 'ASC']] },
        { model: ClearanceStatusHistory, as: 'history', order: [['createdAt', 'ASC']] },
      ],
    });

    if (!request) {
      throw new Error('Customs clearance request not found');
    }

    return this.formatClearanceResponse(request);
  }

  /**
   * Admin / Officer Modify Status of a Clearance Request
   */
  public static async updateRequestStatus(
    requestId: string,
    adminUser: any,
    newStatus: ClearanceStatus,
    note?: string,
    requiredActionNote?: string
  ) {
    const request = await ClearanceRequest.findOne({
      where: {
        [Op.or]: [{ id: requestId }, { requestNumber: requestId }],
      },
    });

    if (!request) throw new Error('Clearance request not found');

    const previousStatus = request.status;
    const adminName = adminUser
      ? `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin'
      : 'Clearance Officer';

    const transaction = await sequelize.transaction();

    try {
      const updateData: any = { status: newStatus };
      if (requiredActionNote !== undefined) {
        updateData.requiredActionNote = requiredActionNote;
      }

      await request.update(updateData, { transaction });

      // Add status history
      const historyMessage =
        note?.trim() ||
        `Status changed from ${previousStatus} to ${newStatus} by ${adminName}.`;

      await ClearanceStatusHistory.create(
        {
          clearanceRequestId: request.id,
          status: newStatus,
          message: historyMessage,
        },
        { transaction }
      );

      // Add staff/system message in thread
      await ClearanceMessage.create(
        {
          clearanceRequestId: request.id,
          senderId: adminUser?.id || undefined,
          senderName: adminName,
          senderRole: 'support',
          message: note?.trim() || `Clearance status updated to: ${newStatus}`,
          isSystemMessage: false,
        },
        { transaction }
      );

      // Notify customer
      await Notification.create(
        {
          userId: request.customerId,
          title: 'Customs Clearance Update',
          message: `Your clearance request ${request.requestNumber} status has been updated to "${newStatus}".`,
          type: 'clearance',
          isRead: false,
          referenceId: request.id,
        },
        { transaction }
      );

      await transaction.commit();

      return this.getClearanceRequestById(request.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Customer upload additional document for clearance request
   */
  public static async uploadDocument(requestId: string, customerId: string, docPayload: any) {
    const request = await ClearanceRequest.findOne({
      where: { id: requestId, customerId },
    });
    if (!request) throw new Error('Clearance request not found');

    const isNotAvailable = Boolean(docPayload.isNotAvailable ?? docPayload.isMissingNoted ?? false);

    const document = await ClearanceDocument.create({
      clearanceRequestId: request.id,
      documentType: docPayload.documentType || 'Other Document',
      fileName: docPayload.fileName || '',
      fileUrl: docPayload.fileUrl || '',
      status: docPayload.status || (isNotAvailable ? 'Not Available' : 'Uploaded'),
      isNotAvailable,
      isMissingNoted: isNotAvailable,
      note: docPayload.note || docPayload.notes || null,
      notes: docPayload.note || docPayload.notes || null,
      uploadedAt: new Date(),
    });

    // If request was awaiting additional information, resume document review
    if (request.status === 'ADDITIONAL_INFORMATION_REQUIRED') {
      await request.update({ status: 'DOCUMENT_REVIEW' });
      await ClearanceStatusHistory.create({
        clearanceRequestId: request.id,
        status: 'DOCUMENT_REVIEW',
        message: `Customer uploaded document (${docPayload.fileName || 'file'}). Review resumed.`,
      });
      await ClearanceMessage.create({
        clearanceRequestId: request.id,
        senderName: 'System Bot',
        senderRole: 'system',
        message: `Uploaded document: ${docPayload.fileName || 'file'}. Our team will review the updated file.`,
        isSystemMessage: true,
      });
    }

    return document;
  }

  /**
   * Customer post a message to clearance request thread
   */
  public static async addMessage(
    requestId: string,
    customerId: string,
    messageText: string,
    attachmentUrl?: string
  ) {
    const request = await ClearanceRequest.findOne({
      where: { id: requestId, customerId },
    });
    if (!request) throw new Error('Clearance request not found');

    const user = await User.findByPk(customerId);
    const senderName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Customer';

    const msg = await ClearanceMessage.create({
      clearanceRequestId: request.id,
      senderId: customerId,
      senderName,
      senderRole: 'customer',
      message: messageText,
      attachmentUrl,
      isSystemMessage: false,
    });

    return msg;
  }

  /**
   * Admin add a charge to clearance request (e.g. customs duty, assessment fee)
   */
  public static async addCharge(requestId: string, chargePayload: any) {
    const request = await ClearanceRequest.findOne({
      where: {
        [Op.or]: [{ id: requestId }, { requestNumber: requestId }],
      },
    });
    if (!request) throw new Error('Clearance request not found');

    const charge = await ClearanceCharge.create({
      clearanceRequestId: request.id,
      category: chargePayload.category || 'customs_duty',
      description: chargePayload.description || 'Customs Clearance Assessment Fee',
      amount: Number(chargePayload.amount) || 0,
      currency: chargePayload.currency || 'NGN',
      isConfirmed: chargePayload.isConfirmed ?? true,
      status: chargePayload.status || 'pending',
    });

    return charge;
  }

  /**
   * Customer pay charges via Wallet
   */
  public static async payCharges(requestId: string, customerId: string) {
    const request = await ClearanceRequest.findOne({
      where: { id: requestId, customerId },
      include: [{ model: ClearanceCharge, as: 'charges' }],
    });

    if (!request) throw new Error('Clearance request not found');

    const pendingCharges = (request as any).charges.filter(
      (c: any) => c.status === 'pending'
    );

    if (pendingCharges.length === 0) {
      throw new Error('No pending charges to pay for this clearance request');
    }

    const totalAmount = pendingCharges.reduce(
      (sum: number, c: any) => sum + Number(c.amount || 0),
      0
    );

    const wallet = await Wallet.findOne({ where: { userId: customerId } });
    if (!wallet) throw new Error('Customer wallet not found');

    if (Number(wallet.balance) < totalAmount) {
      throw new Error(
        `Insufficient wallet balance. Required: ₦${totalAmount.toLocaleString()}, Available: ₦${Number(wallet.balance).toLocaleString()}`
      );
    }

    const transaction = await sequelize.transaction();

    try {
      // Deduct Wallet
      const newBalance = Number(wallet.balance) - totalAmount;
      await wallet.update({ balance: newBalance, availableBalance: newBalance }, { transaction });

      // Record Wallet Transaction
      const user = await User.findByPk(customerId, { transaction });
      await WalletTransaction.create(
        {
          walletId: wallet.id,
          userId: customerId,
          customerId: user?.customerId || customerId,
          type: 'debit',
          category: 'clearance_fee',
          amount: totalAmount,
          currency: 'NGN',
          balanceAfter: newBalance,
          description: `Customs Clearance Charges Payment (${request.requestNumber})`,
          referenceId: request.id,
          reference: `CLR-PAY-${request.requestNumber}-${Date.now()}`,
          status: 'completed',
        },
        { transaction }
      );

      // Update charges status
      for (const charge of pendingCharges) {
        await charge.update({ status: 'paid', isConfirmed: true }, { transaction });
      }

      // Advance request status
      const nextStatus: ClearanceStatus =
        request.status === 'AWAITING_PAYMENT' ? 'CUSTOMS_RELEASED' : request.status;
      await request.update({ status: nextStatus }, { transaction });

      // Add History & System Message
      await ClearanceStatusHistory.create(
        {
          clearanceRequestId: request.id,
          status: nextStatus,
          message: `Payment of ₦${totalAmount.toLocaleString()} confirmed via Wallet.`,
        },
        { transaction }
      );

      await ClearanceMessage.create(
        {
          clearanceRequestId: request.id,
          senderName: 'System Bot',
          senderRole: 'system',
          message: `Payment Confirmation: ₦${totalAmount.toLocaleString()} has been received for clearance charges. Status updated to ${nextStatus}.`,
          isSystemMessage: true,
        },
        { transaction }
      );

      await Notification.create(
        {
          userId: customerId,
          title: 'Clearance Payment Successful',
          message: `₦${totalAmount.toLocaleString()} paid for request ${request.requestNumber}.`,
          type: 'clearance',
          isRead: false,
          referenceId: request.id,
        },
        { transaction }
      );

      await transaction.commit();

      return this.getClearanceRequestById(request.id, customerId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Cancel clearance request
   */
  public static async cancelClearanceRequest(requestId: string, customerId: string, reason?: string) {
    const request = await ClearanceRequest.findOne({
      where: { id: requestId, customerId },
    });
    if (!request) throw new Error('Clearance request not found');

    if (request.status === 'CUSTOMS_RELEASED' || request.status === 'COMPLETED') {
      throw new Error('Cannot cancel a clearance request that has already been released or completed');
    }

    await request.update({ status: 'CANCELLED' });

    await ClearanceStatusHistory.create({
      clearanceRequestId: request.id,
      status: 'CANCELLED',
      message: `Request cancelled by customer. Reason: ${reason || 'User cancelled'}`,
    });

    await ClearanceMessage.create({
      clearanceRequestId: request.id,
      senderName: 'System Bot',
      senderRole: 'system',
      message: `Request ${request.requestNumber} has been cancelled.`,
      isSystemMessage: true,
    });

    return this.formatClearanceResponse(request);
  }
}
