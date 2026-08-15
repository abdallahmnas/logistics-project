import { ProcurementRequest, User } from '../models';

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

    return ProcurementRequest.create({
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
    return proc;
  }

  public static async updateStatus(id: string, status: string) {
    const proc = await ProcurementRequest.findByPk(id);
    if (!proc) throw new Error('Procurement request not found');

    const allowed = ['submitted', 'quoted', 'approved', 'purchased', 'shipped', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}`);

    (proc as any).status = status;
    await proc.save();
    return proc;
  }
}
