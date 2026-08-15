import { Package, Consolidation, Batch, User } from '../models';
import { uploadBase64ToCloudinary } from '../config/cloudinary';

export class ShipmentService {

  // ─── Pre Alert ────────────────────────────────────────────────────────────
  public static async createPreAlert(userId: string, payload: {
    chineseTrackingNo: string;
    supplierName?: string;
    description: string;
    estimatedItems?: number;
    notes?: string;
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const count = (await Package.count()) + 1;
    const trackingId = `HZ-AIR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count).padStart(3, '0')}`;

    const pkg = await Package.create({
      trackingId,
      chineseTrackingNo: payload.chineseTrackingNo,
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      status: 'pre_alerted',
      description: payload.description,
      weightKg: 0,
      cbm: 0,
      paymentStatus: 'unpaid',
      preAlertDate: new Date(),
    });
    return pkg;
  }

  // ─── Admin: Create Inbound Package Directly ───────────────────────────────
  public static async adminCreatePackage(payload: {
    trackingId: string;
    chineseTrackingNo?: string;
    customerId: string;
    customerName: string;
    description: string;
    weightKg: number;
    cbm?: number;
    status?: string;
  }) {
    const count = (await Package.count()) + 1;
    const trackingId = payload.trackingId ||
      `HZ-AIR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(count).padStart(3, '0')}`;

    const length = payload.length || 20;
    const width = payload.width || 20;
    const height = payload.height || 20;
    const cbm = payload.cbm || (length * width * height) / 1000000;

    let uploadedPhotos: string[] = [];
    if (payload.photos && Array.isArray(payload.photos)) {
      uploadedPhotos = await Promise.all(
        payload.photos.map((img: string) => uploadBase64ToCloudinary(img, 'packages'))
      );
    }

    const pkg = await Package.create({
      trackingId,
      chineseTrackingNo: payload.chineseTrackingNo || '—',
      customerId: payload.customerId,
      customerName: payload.customerName,
      status: (payload.status as any) || 'received_cn',
      description: payload.description,
      weightKg: payload.weightKg || 0,
      cbm,
      dimensions: { length, width, height },
      photos: uploadedPhotos,
      paymentStatus: 'unpaid',
      preAlertDate: new Date(),
      receivedDate: new Date(),
    });
    return pkg;
  }

  // ─── Packages ─────────────────────────────────────────────────────────────
  public static async getCustomerPackages(customerId: string) {
    return Package.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
  }

  public static async getAllPackages() {
    return Package.findAll({ order: [['createdAt', 'DESC']] });
  }

  // ─── Public Tracking ──────────────────────────────────────────────────────
  public static async trackPackage(trackingId: string) {
    const pkg = await Package.findOne({ where: { trackingId } });
    if (!pkg) throw new Error('Package not found. Please check your tracking ID.');
    // Return limited public-safe fields
    return {
      trackingId: pkg.trackingId,
      status: pkg.status,
      description: pkg.description,
      weightKg: pkg.weightKg,
      preAlertDate: pkg.preAlertDate,
      receivedDate: pkg.receivedDate,
      shippedDate: pkg.shippedDate,
      arrivedDate: pkg.arrivedDate,
      deliveredDate: pkg.deliveredDate,
      updatedAt: pkg.updatedAt,
    };
  }

  // ─── Scan Package (warehouse: update weight + dimensions) ─────────────────
  public static async scanPackage(packageId: string, payload: {
    weightKg: number;
    length: number;
    width: number;
    height: number;
    description?: string;
    customerId?: string;
    customerName?: string;
    photos?: string[];
  }) {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) throw new Error('Package not found');

    const cbm = (payload.length * payload.width * payload.height) / 1_000_000;
    pkg.weightKg = payload.weightKg;
    pkg.cbm = cbm;
    (pkg as any).dimensions = { length: payload.length, width: payload.width, height: payload.height };
    if (payload.description) pkg.description = payload.description;
    if (payload.customerId) pkg.customerId = payload.customerId;
    if (payload.customerName) pkg.customerName = payload.customerName;
    if (payload.photos && Array.isArray(payload.photos)) {
      const uploadedCloudinaryUrls = await Promise.all(
        payload.photos.map((img) => uploadBase64ToCloudinary(img, 'packages'))
      );
      pkg.photos = uploadedCloudinaryUrls;
    }
    pkg.status = 'received_cn';
    pkg.receivedDate = new Date();
    await pkg.save();
    return pkg;
  }

  // ─── Consolidation ────────────────────────────────────────────────────────
  public static async consolidatePackages(userId: string, payload: {
    packageIds: string[];
    shippingMethod: 'air' | 'sea';
    destinationWarehouse: 'lagos' | 'abuja' | 'kano';
    paymentMethod: 'wallet' | 'pod' | 'cash_on_delivery' | 'bank_transfer';
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const packages = await Package.findAll({ where: { id: payload.packageIds } });
    if (!packages || packages.length === 0) throw new Error('No valid packages selected');

    const totalWeightKg = packages.reduce((acc, p) => acc + (p.weightKg || 0), 0);
    const totalCbm = packages.reduce((acc, p) => acc + (p.cbm || 0), 0);
    const ratePerKg = payload.shippingMethod === 'air' ? 10 : 2;
    const shippingFee = totalWeightKg * ratePerKg;

    const count = (await Consolidation.count()) + 1;
    const consolidationId = `CON-${10000 + count}`;

    const consolidation = await Consolidation.create({
      consolidationId,
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      packageIds: payload.packageIds,
      shippingMethod: payload.shippingMethod,
      destinationWarehouse: payload.destinationWarehouse,
      paymentMethod: payload.paymentMethod,
      totalWeightKg,
      totalCbm,
      shippingFee,
      status: 'ready_to_batch',
    });

    await Package.update({ status: 'consolidating' }, { where: { id: payload.packageIds } });
    return consolidation;
  }

  public static async getConsolidations(customerId?: string) {
    if (customerId) return Consolidation.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return Consolidation.findAll({ order: [['createdAt', 'DESC']] });
  }

  // ─── Batches ──────────────────────────────────────────────────────────────
  public static async createBatch(payload: {
    carrierName: string;
    flightVoyageNo: string;
    containerNo?: string;
    shippingType: 'air' | 'sea';
    packageIds?: string[];
    consolidationIds?: string[];
  }) {
    const count = (await Batch.count()) + 1;
    const typeTag = payload.shippingType.toUpperCase();
    const masterTrackingId = `HZ-BATCH-${typeTag}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${count}`;

    const batch = await Batch.create({
      masterTrackingId,
      carrierName: payload.carrierName,
      flightVoyageNo: payload.flightVoyageNo,
      containerNo: payload.containerNo,
      shippingType: payload.shippingType,
      status: 'shipping_exported',
      consolidationIds: payload.consolidationIds || [],
      packageIds: payload.packageIds || [],
      consolidationCount: (payload.consolidationIds || []).length,
      packageCount: (payload.packageIds || []).length,
      totalWeightKg: 0,
      totalCbm: 0,
      departureDate: new Date(),
    });
    return batch;
  }

  public static async getBatches() {
    return Batch.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async addPackagesToBatch(batchId: string, packageIds: string[]) {
    const batch = await Batch.findByPk(batchId);
    if (!batch) throw new Error('Batch not found');

    const current = (batch as any).packageIds || [];
    const merged = [...new Set([...current, ...packageIds])];
    (batch as any).packageIds = merged;
    (batch as any).packageCount = merged.length;
    await batch.save();

    // Mark packages as consolidating/batched
    await Package.update({ status: 'consolidating' }, { where: { id: packageIds } });
    return batch;
  }

  // ─── Update Package Status ────────────────────────────────────────────────
  public static async updatePackageStatus(packageId: string, status: any, extra?: any) {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) throw new Error('Package not found');

    pkg.status = status;
    if (status === 'received_cn') pkg.receivedDate = new Date();
    if (status === 'shipping_exported') pkg.shippedDate = new Date();
    if (status === 'arrived_ng') pkg.arrivedDate = new Date();
    if (status === 'delivered') pkg.deliveredDate = new Date();
    if (extra?.weightKg !== undefined) pkg.weightKg = extra.weightKg;
    if (extra?.cbm !== undefined) pkg.cbm = extra.cbm;
    if (extra?.photos !== undefined) pkg.photos = extra.photos;

    await pkg.save();
    return pkg;
  }
}
