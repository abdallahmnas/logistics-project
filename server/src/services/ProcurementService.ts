import { ProcurementRequest, User } from '../models';
import { ActivityLogService } from './ActivityLogService';

export class ProcurementService {
  public static async createRequest(userId: string, payload: {
    productUrl: string;
    productPhotos?: string[];
    quantity: number;
    specifications: string;
    sizes?: string;
    colors?: string;
    variations?: string;
    notes?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const req = await ProcurementRequest.create({
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      productUrl: payload.productUrl,
      productPhotos: payload.productPhotos || [],
      quantity: payload.quantity || 1,
      specifications: payload.specifications,
      sizes: payload.sizes,
      colors: payload.colors,
      variations: payload.variations,
      notes: payload.notes,
      status: 'submitted',
      submittedAt: new Date(),
    });

    ActivityLogService.logActivity({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      module: 'procurement',
      action: 'SUBMIT_PROCUREMENT',
      description: `Customer submitted Buy-For-Me request for ${payload.quantity} items`,
      entityId: req.id,
    });

    return req;
  }

  public static async getRequests(customerId?: string) {
    if (customerId) return ProcurementRequest.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return ProcurementRequest.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async quoteRequest(id: string, payload: {
    productCostRmb: number;
    serviceFeeRmb: number;
    supplierName: string;
    exchangeRateUsed?: number;
  }) {
    const proc = await ProcurementRequest.findByPk(id);
    if (!proc) throw new Error('Procurement request not found');

    const totalCostRmb = Number(payload.productCostRmb) + Number(payload.serviceFeeRmb);
    const rate = payload.exchangeRateUsed || 215;
    const totalCostNaira = Math.round(totalCostRmb * rate);

    proc.productCostRmb = payload.productCostRmb;
    proc.serviceFeeRmb = payload.serviceFeeRmb;
    proc.totalCostRmb = totalCostRmb;
    proc.exchangeRateUsed = rate;
    proc.totalCostNaira = totalCostNaira;
    proc.supplierName = payload.supplierName;
    proc.status = 'quoted';
    proc.quotedAt = new Date();
    await proc.save();

    ActivityLogService.logActivity({
      userId: proc.customerId,
      userName: proc.customerName,
      userRole: 'procurement',
      module: 'procurement',
      action: 'QUOTE_REQUEST',
      description: `Issued quote for procurement request ${proc.id} (¥${totalCostRmb} / ₦${totalCostNaira.toLocaleString()})`,
      entityId: proc.id,
    });

    return proc;
  }

  public static async approveRequest(id: string, customerId: string) {
    const proc = await ProcurementRequest.findByPk(id);
    if (!proc) throw new Error('Procurement request not found');
    if (proc.customerId !== customerId) throw new Error('You cannot approve another customer\'s request');
    if (proc.status !== 'quoted') throw new Error('Only quoted requests can be approved');
    proc.status = 'approved';
    proc.approvedAt = new Date();
    await proc.save();

    ActivityLogService.logActivity({
      userId: proc.customerId,
      userName: proc.customerName,
      userRole: 'customer',
      module: 'procurement',
      action: 'APPROVE_QUOTE',
      description: `Customer approved procurement quote ${proc.id}`,
      entityId: proc.id,
    });

    return proc;
  }

  public static async updateStatus(id: string, status: string) {
    const proc = await ProcurementRequest.findByPk(id);
    if (!proc) throw new Error('Procurement request not found');

    const allowed = ['submitted', 'quoted', 'approved', 'purchased', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}`);

    (proc as any).status = status;
    await proc.save();

    ActivityLogService.logActivity({
      userId: proc.customerId,
      userName: proc.customerName,
      userRole: 'admin',
      module: 'procurement',
      action: 'UPDATE_PROCUREMENT_STATUS',
      description: `Updated procurement request ${proc.id} status to ${status}`,
      entityId: proc.id,
    });

    return proc;
  }
}
