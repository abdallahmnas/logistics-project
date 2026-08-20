import { Package, Consolidation, Batch, User } from '../models';
import { uploadBase64ToCloudinary } from '../config/cloudinary';
import { ActivityLogService } from './ActivityLogService';
import { NotificationService } from './NotificationService';

export class ShipmentService {

  // ─── Pre Alert ────────────────────────────────────────────────────────────
  public static async createPreAlert(userId: string, payload: {
    chineseTrackingNo: string;
    supplierName?: string;
    description: string;
    originCountry?: string;
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
      originCountry: payload.originCountry || 'Guangzhou Hub, China',
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
    let pkg = await Package.findByPk(packageId);
    if (!pkg) {
      pkg = await Package.findOne({ where: { trackingId: packageId } });
    }
    if (!pkg) {
      pkg = await Package.findOne({ where: { chineseTrackingNo: packageId } });
    }

    const cbm = ((payload.length || 0) * (payload.width || 0) * (payload.height || 0)) / 1_000_000;

    let uploadedCloudinaryUrls: string[] = [];
    if (payload.photos && Array.isArray(payload.photos)) {
      uploadedCloudinaryUrls = await Promise.all(
        payload.photos.map(async (img) => {
          if (!img) return '';
          if (img.startsWith('http://') || img.startsWith('https://')) return img;
          if (img.startsWith('data:image')) return uploadBase64ToCloudinary(img, 'packages');
          return img;
        })
      );
      uploadedCloudinaryUrls = uploadedCloudinaryUrls.filter(Boolean);
    }

    if (!pkg) {
      const generatedTrackingId = packageId.startsWith('HZ-') ? packageId : `HZ-AIR-${Date.now().toString().slice(-6)}`;
      pkg = await Package.create({
        trackingId: generatedTrackingId,
        chineseTrackingNo: packageId.startsWith('HZ-') ? '' : packageId,
        weightKg: payload.weightKg || 0,
        cbm: cbm,
        dimensions: { length: payload.length || 0, width: payload.width || 0, height: payload.height || 0 },
        description: payload.description || 'Intake Package',
        customerId: payload.customerId || 'CUST-DEFAULT',
        customerName: payload.customerName || 'Walk-in Customer',
        photos: uploadedCloudinaryUrls,
        status: 'received_cn',
        paymentStatus: 'unpaid',
        preAlertDate: new Date(),
        receivedDate: new Date(),
      });
    } else {
      pkg.weightKg = payload.weightKg;
      pkg.cbm = cbm;
      (pkg as any).dimensions = { length: payload.length, width: payload.width, height: payload.height };
      if (payload.description) pkg.description = payload.description;
      if (payload.customerId) pkg.customerId = payload.customerId;
      if (payload.customerName) pkg.customerName = payload.customerName;
      if (uploadedCloudinaryUrls.length > 0) {
        pkg.photos = uploadedCloudinaryUrls;
      }
      pkg.status = 'received_cn';
      pkg.receivedDate = new Date();
      await pkg.save();
    }

    ActivityLogService.logActivity({
      userId: 'warehouse_staff',
      userName: 'Warehouse Scanner',
      userRole: 'warehouse_cn',
      module: 'warehouse',
      action: 'SCAN_PACKAGE',
      description: `Scanned package ${pkg.trackingId || pkg.id} at China Hub (${payload.weightKg || 0}kg, ${payload.cbm || 0} CBM)`,
      entityId: pkg.id,
    });

    // Multi-Channel Order Status Notification
    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: pkg.customerId,
      orderType: 'Shipment',
      orderId: pkg.trackingId || pkg.id,
      newStatus: 'received_cn',
      statusDescription: `Package received and weighed at China Hub (${payload.weightKg || 0}kg). Ready for consolidation packing.`,
    });

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

    if (!payload.packageIds || payload.packageIds.length === 0) {
      throw new Error('Please select at least one package to consolidate');
    }

    const packages = await Package.findAll({ where: { id: payload.packageIds } });
    if (packages.length !== payload.packageIds.length) throw new Error('One or more selected packages do not exist');
    if (packages.some((pkg) => pkg.customerId !== user.customerId)) {
      throw new Error('You can only consolidate packages assigned to your account');
    }
    if (packages.some((pkg) => !['received_cn', 'ready_to_pack', 'received_at_warehouse', 'at_china_warehouse'].includes(pkg.status))) {
      throw new Error('Only packages physically received at the warehouse (received_cn or ready_to_pack) can be consolidated');
    }

    // Strict Warehouse Check: All packages must be stored at the SAME warehouse facility
    const warehouseSet = new Set(
      packages.map((pkg) => (pkg.originCountry || 'Guangzhou Hub').toLowerCase().trim())
    );
    if (warehouseSet.size > 1) {
      throw new Error(
        'Cannot consolidate packages located at different warehouses. All packages in a single consolidation box must be stored at the same warehouse facility.'
      );
    }

    const originCountry = packages[0]?.originCountry || 'Guangzhou Hub';

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
      originCountry,
      status: 'ready_to_batch',
    });

    await Package.update({ status: 'consolidating' }, { where: { id: payload.packageIds } });

    ActivityLogService.logActivity({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      module: 'shipments',
      action: 'CREATE_CONSOLIDATION',
      description: `Created consolidation shipment ${consolidationId} for ${packages.length} packages`,
      entityId: consolidation.id,
    });

    // Multi-Channel Order Status Notification
    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: user.id,
      orderType: 'Shipment',
      orderId: consolidationId,
      newStatus: 'ready_to_batch',
      statusDescription: `Consolidation ${consolidationId} created with ${packages.length} packages (${totalWeightKg}kg). Queued for overseas freight batch.`,
    });

    return consolidation;
  }

  public static async getConsolidations(customerId?: string) {
    if (customerId) return Consolidation.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return Consolidation.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async updateConsolidationPackages(
    consolidationId: string,
    payload: { packageIds: string[] },
    adminUser?: { id: string; name: string; role: string }
  ) {
    const consolidation = await Consolidation.findByPk(consolidationId);
    if (!consolidation) throw new Error('Consolidation request not found');

    if (consolidation.status !== 'ready_to_batch') {
      throw new Error('Cannot modify consolidation after it has been assigned to a batch or shipped');
    }

    const newPackageIds = payload.packageIds || [];
    if (newPackageIds.length === 0) {
      throw new Error('Consolidation must contain at least one package');
    }

    const currentPackageIds = consolidation.packageIds || [];

    // Removed packages
    const removedIds = currentPackageIds.filter(id => !newPackageIds.includes(id));
    // Added packages
    const addedIds = newPackageIds.filter(id => !currentPackageIds.includes(id));

    // Update removed packages status back to received_cn
    if (removedIds.length > 0) {
      await Package.update({ status: 'received_cn' }, { where: { id: removedIds } });
    }

    // Update added packages status to consolidating
    if (addedIds.length > 0) {
      await Package.update({ status: 'consolidating' }, { where: { id: addedIds } });
    }

    // Recalculate metrics & verify single warehouse facility
    const packages = await Package.findAll({ where: { id: newPackageIds } });
    const warehouseSet = new Set(
      packages.map((pkg) => (pkg.originCountry || 'Guangzhou Hub').toLowerCase().trim())
    );
    if (warehouseSet.size > 1) {
      throw new Error(
        'Cannot add package from a different warehouse into this consolidation box. All packages in a consolidation must be at the same warehouse facility.'
      );
    }

    const totalWeightKg = packages.reduce((acc, p) => acc + (p.weightKg || 0), 0);
    const totalCbm = packages.reduce((acc, p) => acc + (p.cbm || 0), 0);
    const ratePerKg = consolidation.shippingMethod === 'air' ? 10 : 2;
    const shippingFee = totalWeightKg * ratePerKg;

    (consolidation as any).packageIds = newPackageIds;
    (consolidation as any).totalWeightKg = totalWeightKg;
    (consolidation as any).totalCbm = totalCbm;
    (consolidation as any).shippingFee = shippingFee;
    await consolidation.save();

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        module: 'shipments',
        action: 'UPDATE_CONSOLIDATION',
        description: `Updated consolidation ${consolidation.consolidationId} (Added: ${addedIds.length}, Removed: ${removedIds.length})`,
        entityId: consolidation.id,
      });
    }

    return consolidation;
  }

  // ─── Batches ──────────────────────────────────────────────────────────────
  public static async createBatch(payload: {
    masterTrackingId?: string;
    carrierName: string;
    flightVoyageNo: string;
    containerNo?: string;
    shippingType: 'air' | 'sea';
    packageIds?: string[];
    consolidationIds?: string[];
  }) {
    const count = (await Batch.count()) + 1;
    const typeTag = (payload.shippingType || 'AIR').toUpperCase();
    let masterTrackingId = payload.masterTrackingId;
    if (!masterTrackingId) {
      masterTrackingId = `HZ-BATCH-${typeTag}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${count}`;
    }

    const existing = await Batch.findOne({ where: { masterTrackingId } });
    if (existing) {
      masterTrackingId = `${masterTrackingId}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const consolidationIds = payload.consolidationIds || payload.packageIds || [];
    
    // Fetch attached consolidations to calculate exact metrics & attached packages
    const consolidations = await Consolidation.findAll({ where: { id: consolidationIds } });
    const totalWeightKg = consolidations.reduce((sum, c) => sum + (c.totalWeightKg || 0), 0);
    const totalCbm = consolidations.reduce((sum, c) => sum + (c.totalCbm || 0), 0);
    
    const allPackageIds = Array.from(
      new Set(consolidations.flatMap((c) => c.packageIds || []))
    );

    const batch = await Batch.create({
      masterTrackingId,
      carrierName: payload.carrierName,
      flightVoyageNo: payload.flightVoyageNo,
      containerNo: payload.containerNo,
      shippingType: payload.shippingType,
      status: 'shipping_exported',
      consolidationIds,
      packageIds: allPackageIds,
      consolidationCount: consolidationIds.length,
      packageCount: allPackageIds.length,
      totalWeightKg,
      totalCbm,
      departureDate: new Date(),
    });

    // Update status of batched consolidations & underlying packages
    if (consolidationIds.length > 0) {
      await Consolidation.update({ status: 'batched' }, { where: { id: consolidationIds } });

      if (allPackageIds.length > 0) {
        await Package.update({ status: 'shipping_exported', shippedDate: new Date() }, { where: { id: allPackageIds } });
      }

      // Notify customers of batched consolidations
      for (const c of consolidations) {
        NotificationService.sendOrderStatusNotification({
          userIdOrCustomerId: c.customerId,
          orderType: 'Shipment',
          orderId: c.consolidationId,
          newStatus: 'shipping_exported',
          statusDescription: `Master Batch ${batch.masterTrackingId} (${batch.carrierName} ${batch.flightVoyageNo}) has departed China warehouse and is in transit to Nigeria.`,
        });
      }
    }

    ActivityLogService.logActivity({
      userId: 'warehouse_cn',
      userName: 'Warehouse Export Manager',
      userRole: 'warehouse_cn',
      module: 'warehouse',
      action: 'CREATE_MASTER_BATCH',
      description: `Created Master ${typeTag} Batch ${masterTrackingId} with Carrier ${payload.carrierName} (${totalWeightKg}kg / ${totalCbm}cbm)`,
      entityId: batch.id,
    });

    return batch;
  }

  public static async getBatches() {
    return Batch.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async addPackagesToBatch(batchId: string, packageIds: string[]) {
    const batch = await Batch.findByPk(batchId);
    if (!batch) throw new Error('Batch not found');

    const currentConsolidationIds = (batch as any).consolidationIds || [];
    const mergedConsolidations = [...new Set([...currentConsolidationIds, ...packageIds])];
    
    const consolidations = await Consolidation.findAll({ where: { id: mergedConsolidations } });
    const totalWeightKg = consolidations.reduce((sum, c) => sum + (c.totalWeightKg || 0), 0);
    const totalCbm = consolidations.reduce((sum, c) => sum + (c.totalCbm || 0), 0);
    const allPackageIds = Array.from(
      new Set(consolidations.flatMap((c) => c.packageIds || []))
    );

    (batch as any).consolidationIds = mergedConsolidations;
    (batch as any).consolidationCount = mergedConsolidations.length;
    (batch as any).packageIds = allPackageIds;
    (batch as any).packageCount = allPackageIds.length;
    (batch as any).totalWeightKg = totalWeightKg;
    (batch as any).totalCbm = totalCbm;
    await batch.save();

    // Mark consolidations as batched and packages as shipping_exported
    await Consolidation.update({ status: 'batched' }, { where: { id: packageIds } });
    if (allPackageIds.length > 0) {
      await Package.update({ status: 'shipping_exported' }, { where: { id: allPackageIds } });
    }

    return batch;
  }

  public static async updateBatchStatus(batchId: string, status: string, adminUser?: any) {
    const batch = await Batch.findByPk(batchId);
    if (!batch) throw new Error('Batch not found');

    batch.status = status as any;
    if (status === 'arrived_ng') batch.arrivedDate = new Date();
    await batch.save();

    const consolidationIds = batch.consolidationIds || [];
    const packageIds = batch.packageIds || [];

    if (status === 'arrived_ng') {
      if (consolidationIds.length > 0) {
        await Consolidation.update({ status: 'arrived_destination' }, { where: { id: consolidationIds } });
      }
      if (packageIds.length > 0) {
        await Package.update({ status: 'arrived_destination', arrivedDate: new Date() }, { where: { id: packageIds } });
      }
    } else if (status === 'delivered') {
      if (consolidationIds.length > 0) {
        await Consolidation.update({ status: 'delivered' }, { where: { id: consolidationIds } });
      }
      if (packageIds.length > 0) {
        await Package.update({ status: 'delivered', deliveredDate: new Date() }, { where: { id: packageIds } });
      }
    }

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        module: 'warehouse',
        action: 'UPDATE_BATCH_STATUS',
        description: `Updated Master Batch ${batch.masterTrackingId} status to ${status}`,
        entityId: batch.id,
      });
    }

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
