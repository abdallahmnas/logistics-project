import {
  ClearanceRequest,
  ClearanceItem,
  ClearanceDocument,
  ClearanceCharge,
  ClearanceMessage,
  ClearanceStatusHistory,
  User,
  Wallet,
  WalletTransaction,
  Notification,
} from '../models';
import { sequelize } from '../config/database';

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
   * Create a new Customs Clearance Request (Draft or Submitted)
   */
  public static async createClearanceRequest(customerId: string, payload: any) {
    const user = await User.findByPk(customerId);
    if (!user) throw new Error('Customer account not found');

    const transaction = await sequelize.transaction();

    try {
      const isDraft = payload.isDraft === true;
      const status = isDraft ? 'DRAFT' : 'SUBMITTED';

      let totalValueUsd = 0;
      if (Array.isArray(payload.items)) {
        totalValueUsd = payload.items.reduce(
          (sum: number, item: any) => sum + Number(item.value || 0),
          0
        );
      }

      const requestNumber = this.generateRequestNumber();

      const clearanceRequest = await ClearanceRequest.create(
        {
          requestNumber,
          customerId,
          customerName: `${user.firstName} ${user.lastName}`.trim(),
          customerPhone: user.phone,
          customerEmail: user.email,
          shipmentType: payload.shipmentType || 'sea',
          originCountry: payload.originCountry || 'China',
          portOfEntry: payload.portOfEntry || 'Apapa Port',
          shipmentStatus: payload.shipmentStatus || 'in_transit',
          shippingLine: payload.shippingLine,
          airline: payload.airline,
          billOfLadingNumber: payload.billOfLadingNumber,
          airWaybillNumber: payload.airWaybillNumber,
          containerNumber: payload.containerNumber,
          estimatedArrivalDate: payload.estimatedArrivalDate,
          noShippingInfoProvided: payload.noShippingInfoProvided || false,
          status,
          deliveryPreference: payload.deliveryPreference || 'deliver_to_me',
          recipientName: payload.recipientName || `${user.firstName} ${user.lastName}`.trim(),
          recipientPhone: payload.recipientPhone || user.phone,
          deliveryAddress: payload.deliveryAddress,
          city: payload.city,
          state: payload.state,
          deliveryInstructions: payload.deliveryInstructions,
          totalValueUsd,
          totalProductsCount: Array.isArray(payload.items) ? payload.items.length : 0,
          isConfirmedAccurate: payload.isConfirmedAccurate ?? true,
        },
        { transaction }
      );

      // Create Items
      if (Array.isArray(payload.items) && payload.items.length > 0) {
        const itemRecords = payload.items.map((it: any) => ({
          clearanceRequestId: clearanceRequest.id,
          productName: it.productName || 'Imported Goods',
          description: it.description || '',
          category: it.category || 'General Cargo',
          quantity: Number(it.quantity) || 1,
          unit: it.unit || 'pcs',
          value: Number(it.value) || 0,
          currency: it.currency || 'USD',
          countryOfManufacture: it.countryOfManufacture || 'China',
          hsCode: it.hsCode || '',
          weight: it.weight ? Number(it.weight) : undefined,
          volume: it.volume ? Number(it.volume) : undefined,
        }));
        await ClearanceItem.bulkCreate(itemRecords, { transaction });
      }

      // Create Documents
      if (Array.isArray(payload.documents) && payload.documents.length > 0) {
        const docRecords = payload.documents.map((doc: any) => ({
          clearanceRequestId: clearanceRequest.id,
          documentType: doc.documentType || 'commercial_invoice',
          fileName: doc.fileName || 'document.pdf',
          fileUrl: doc.fileUrl,
          status: 'uploaded',
          isMissingNoted: doc.isMissingNoted || false,
        }));
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

      // Create initial system message
      if (!isDraft) {
        await ClearanceMessage.create(
          {
            clearanceRequestId: clearanceRequest.id,
            senderName: 'System Bot',
            senderRole: 'system',
            message: `Your clearance request ${requestNumber} was submitted successfully. Our customs documentation team will review your uploaded files and provide status updates here.`,
            isSystemMessage: true,
          },
          { transaction }
        );

        // Add initial estimated charge breakdown placeholder
        const estServiceFee = payload.shipmentType === 'air' ? 45000 : 85000;
        await ClearanceCharge.create(
          {
            clearanceRequestId: clearanceRequest.id,
            category: 'service_fee',
            description: 'Customs Clearance Documentation & Processing Fee (Estimated)',
            amount: estServiceFee,
            currency: 'NGN',
            isConfirmed: false,
            status: 'pending',
          },
          { transaction }
        );

        if (payload.deliveryPreference === 'deliver_to_me') {
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

    if (request.status !== 'DRAFT' && request.status !== 'SUBMITTED' && request.status !== 'ADDITIONAL_INFORMATION_REQUIRED') {
      throw new Error('This request cannot be modified in its current status');
    }

    const transaction = await sequelize.transaction();

    try {
      const isSubmitting = payload.submit === true || payload.isDraft === false;

      let totalValueUsd = request.totalValueUsd;
      if (Array.isArray(payload.items)) {
        totalValueUsd = payload.items.reduce(
          (sum: number, item: any) => sum + Number(item.value || 0),
          0
        );
      }

      const updatedStatus = isSubmitting
        ? request.status === 'ADDITIONAL_INFORMATION_REQUIRED'
          ? 'DOCUMENT_REVIEW'
          : 'SUBMITTED'
        : request.status;

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
          noShippingInfoProvided: payload.noShippingInfoProvided ?? request.noShippingInfoProvided,
          status: updatedStatus,
          deliveryPreference: payload.deliveryPreference || request.deliveryPreference,
          recipientName: payload.recipientName ?? request.recipientName,
          recipientPhone: payload.recipientPhone ?? request.recipientPhone,
          deliveryAddress: payload.deliveryAddress ?? request.deliveryAddress,
          city: payload.city ?? request.city,
          state: payload.state ?? request.state,
          deliveryInstructions: payload.deliveryInstructions ?? request.deliveryInstructions,
          totalValueUsd,
          totalProductsCount: Array.isArray(payload.items) ? payload.items.length : request.totalProductsCount,
          isConfirmedAccurate: payload.isConfirmedAccurate ?? request.isConfirmedAccurate,
        },
        { transaction }
      );

      // Replace items if provided
      if (Array.isArray(payload.items)) {
        await ClearanceItem.destroy({ where: { clearanceRequestId: request.id }, transaction });
        const itemRecords = payload.items.map((it: any) => ({
          clearanceRequestId: request.id,
          productName: it.productName || 'Imported Goods',
          description: it.description || '',
          category: it.category || 'General Cargo',
          quantity: Number(it.quantity) || 1,
          unit: it.unit || 'pcs',
          value: Number(it.value) || 0,
          currency: it.currency || 'USD',
          countryOfManufacture: it.countryOfManufacture || 'China',
          hsCode: it.hsCode || '',
          weight: it.weight ? Number(it.weight) : undefined,
          volume: it.volume ? Number(it.volume) : undefined,
        }));
        await ClearanceItem.bulkCreate(itemRecords, { transaction });
      }

      // Add new documents if provided
      if (Array.isArray(payload.documents) && payload.documents.length > 0) {
        const docRecords = payload.documents.map((doc: any) => ({
          clearanceRequestId: request.id,
          documentType: doc.documentType || 'commercial_invoice',
          fileName: doc.fileName || 'document.pdf',
          fileUrl: doc.fileUrl,
          status: 'uploaded',
          isMissingNoted: doc.isMissingNoted || false,
        }));
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
        where.status = ['SUBMITTED', 'DOCUMENT_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'CLEARANCE_PROCESSING', 'CUSTOMS_ASSESSMENT', 'INSPECTION', 'AWAITING_PAYMENT', 'CUSTOMS_RELEASED', 'DELIVERY', 'ON_HOLD'];
      } else if (filter.status === 'COMPLETED') {
        where.status = 'COMPLETED';
      } else if (filter.status === 'CANCELLED') {
        where.status = 'CANCELLED';
      } else {
        where.status = filter.status;
      }
    }

    const requests = await ClearanceRequest.findAll({
      where,
      include: [
        { model: ClearanceItem, as: 'items' },
        { model: ClearanceDocument, as: 'documents' },
        { model: ClearanceCharge, as: 'charges' },
      ],
      order: [['createdAt', 'DESC']],
    });

    return requests;
  }

  /**
   * Get single clearance request details by ID or Request Number
   */
  public static async getClearanceRequestById(requestIdOrNumber: string, customerId: string) {
    const request = await ClearanceRequest.findOne({
      where: {
        customerId,
        [sequelize.Sequelize.Op.or]: [
          { id: requestIdOrNumber },
          { requestNumber: requestIdOrNumber },
        ],
      },
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

    return request;
  }

  /**
   * Customer upload additional document for clearance request
   */
  public static async uploadDocument(requestId: string, customerId: string, docPayload: any) {
    const request = await ClearanceRequest.findOne({
      where: { id: requestId, customerId },
    });
    if (!request) throw new Error('Clearance request not found');

    const document = await ClearanceDocument.create({
      clearanceRequestId: request.id,
      documentType: docPayload.documentType || 'other',
      fileName: docPayload.fileName || 'uploaded_file',
      fileUrl: docPayload.fileUrl,
      status: 'uploaded',
    });

    // If request was awaiting additional information, log system notification
    if (request.status === 'ADDITIONAL_INFORMATION_REQUIRED') {
      await request.update({ status: 'DOCUMENT_REVIEW' });
      await ClearanceStatusHistory.create({
        clearanceRequestId: request.id,
        status: 'DOCUMENT_REVIEW',
        message: `Customer uploaded document (${docPayload.fileName}). Review resumed.`,
      });
      await ClearanceMessage.create({
        clearanceRequestId: request.id,
        senderName: 'System Bot',
        senderRole: 'system',
        message: `Uploaded document: ${docPayload.fileName}. Our team will review the updated file.`,
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
      await WalletTransaction.create(
        {
          walletId: wallet.id,
          userId: customerId,
          type: 'DEBIT',
          amount: totalAmount,
          balanceAfter: newBalance,
          description: `Customs Clearance Charges Payment (${request.requestNumber})`,
          reference: `CLR-PAY-${request.requestNumber}-${Date.now()}`,
          status: 'COMPLETED',
        },
        { transaction }
      );

      // Update charges status
      for (const charge of pendingCharges) {
        await charge.update({ status: 'paid', isConfirmed: true }, { transaction });
      }

      // Advance request status
      const nextStatus = request.status === 'AWAITING_PAYMENT' ? 'CUSTOMS_RELEASED' : request.status;
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

    return request;
  }
}
