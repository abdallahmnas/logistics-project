import { Op } from 'sequelize';
import { Package, Consolidation, Batch, User, Wallet } from '../models';
import { uploadBase64ToCloudinary } from '../config/cloudinary';
import { ActivityLogService } from './ActivityLogService';
import { NotificationService } from './NotificationService';
import { SettingsService } from './SettingsService';

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

    // 1. Notify Customer
    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: user.id,
      orderType: 'Shipment',
      orderId: pkg.trackingId,
      newStatus: 'pre_alerted',
      statusDescription: `Pre-alert created successfully for "${payload.description}". China tracking: ${payload.chineseTrackingNo}.`,
    });

    // 2. Notify Admins & Warehouse Staff
    NotificationService.notifyAdmins({
      title: 'New Package Pre-Alert',
      message: `Customer ${user.firstName} ${user.lastName} pre-alerted package ${pkg.trackingId} (${payload.chineseTrackingNo}).`,
      type: 'shipment',
      referenceId: pkg.trackingId,
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
  public static async trackPackage(trackingIdStr: string) {
    const term = trackingIdStr.trim();
    let pkg = await Package.findOne({
      where: {
        [Op.or]: [
          { trackingId: term },
          { chineseTrackingNo: term },
          { id: term },
        ]
      }
    });

    if (!pkg && term.length >= 3) {
      pkg = await Package.findOne({
        where: {
          [Op.or]: [
            { trackingId: { [Op.like]: `%${term}%` } },
            { chineseTrackingNo: { [Op.like]: `%${term}%` } },
          ]
        }
      });
    }

    if (!pkg) throw new Error('Package not found. Please verify your tracking ID or Chinese courier number.');

    return {
      id: pkg.id,
      trackingId: pkg.trackingId,
      chineseTrackingNo: pkg.chineseTrackingNo,
      courierName: pkg.courierName,
      supplierName: pkg.supplierName,
      status: pkg.status,
      shippingType: pkg.shippingType || 'air',
      description: pkg.description,
      weightKg: pkg.weightKg,
      cbm: pkg.cbm,
      originWarehouse: 'China Air Cargo Hub (Yiwu/Guangzhou)',
      destinationWarehouse: pkg.destinationWarehouse || 'Nigeria Office Hub (Kano/Lagos)',
      preAlertDate: pkg.preAlertDate,
      receivedDate: pkg.receivedDate,
      shippedDate: pkg.shippedDate,
      arrivedDate: pkg.arrivedDate,
      deliveredDate: pkg.deliveredDate,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }

  public static async scanPackage(packageId: string, payload: {
    weightKg: number;
    length: number;
    width: number;
    height: number;
    status?: string;
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

    const targetStatus = payload.status || 'received_cn';
    const now = new Date();

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
        status: targetStatus as any,
        paymentStatus: 'unpaid',
        preAlertDate: now,
        receivedDate: now,
        shippedDate: targetStatus === 'shipped' ? now : undefined,
        arrivedDate: targetStatus === 'arrived_ng' ? now : undefined,
        deliveredDate: targetStatus === 'delivered' ? now : undefined,
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
      pkg.status = targetStatus as any;
      if (!pkg.receivedDate) pkg.receivedDate = now;
      if (targetStatus === 'shipped' && !pkg.shippedDate) pkg.shippedDate = now;
      if (targetStatus === 'arrived_ng' && !pkg.arrivedDate) pkg.arrivedDate = now;
      if (targetStatus === 'delivered' && !pkg.deliveredDate) pkg.deliveredDate = now;
      await pkg.save();
    }

    ActivityLogService.logActivity({
      userId: 'warehouse_staff',
      userName: 'Warehouse Scanner',
      userRole: 'warehouse_cn',
      module: 'warehouse',
      action: 'SCAN_PACKAGE',
      description: `Scanned package ${pkg.trackingId || pkg.id} to status "${targetStatus}" (${payload.weightKg || 0}kg, ${payload.cbm || 0} CBM)`,
      entityId: pkg.id,
    });

    // Multi-Channel Order Status Notification
    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: pkg.customerId,
      orderType: 'Shipment',
      orderId: pkg.trackingId || pkg.id,
      newStatus: targetStatus,
      statusDescription: `Package status updated to ${targetStatus.toUpperCase().replace(/_/g, ' ')} (${payload.weightKg || 0}kg).`,
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
    
    // Fetch live platform freight rates
    const settings = await SettingsService.getSettings();
    const airRate = settings?.airFreightRatePerKg || 12500;
    const seaRate = settings?.seaFreightRatePerCbm || 450000;
    
    const shippingFee = payload.shippingMethod === 'air'
      ? (totalWeightKg > 0 ? totalWeightKg * airRate : airRate)
      : (totalCbm > 0 ? totalCbm * seaRate : seaRate);

    // If Pay Now via Wallet, check balance and deduct
    if (payload.paymentMethod === 'wallet') {
      const wallet = await Wallet.findOne({ where: { userId: user.id } });
      const currentBalance = wallet ? wallet.balance : 0;
      if (currentBalance < shippingFee) {
        throw new Error(`Insufficient wallet balance. Total freight fee is ₦${shippingFee.toLocaleString()}, but your balance is ₦${currentBalance.toLocaleString()}. Please top up your wallet.`);
      }
      if (wallet) {
        wallet.balance = wallet.balance - shippingFee;
        wallet.availableBalance = wallet.balance - (wallet.escrowHeld || 0);
        await wallet.save();
      }
    }

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
      status: 'requested',
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
      newStatus: 'requested',
      statusDescription: `Consolidation request ${consolidationId} submitted with ${packages.length} packages (${totalWeightKg}kg). Awaiting warehouse packaging.`,
    });

    return consolidation;
  }

  public static async getConsolidations(customerId?: string) {
    if (customerId) return Consolidation.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return Consolidation.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async updateConsolidationPackages(
    consolidationId: string,
    payload: { packageIds?: string[]; status?: string },
    adminUser?: { id: string; name: string; role: string }
  ) {
    const consolidation = await Consolidation.findByPk(consolidationId);
    if (!consolidation) throw new Error('Consolidation request not found');

    if (consolidation.status === 'batched') {
      throw new Error('Cannot modify consolidation after it has been assigned to a master batch');
    }

    if (payload.status === 'batched') {
      throw new Error('Consolidation status turns to "batched" automatically when assigned to a Master Batch on the Master Batches page.');
    }

    if (payload.status) {
      consolidation.status = payload.status as any;
    }

    const currentPackageIds = consolidation.packageIds || [];
    const newPackageIds = payload.packageIds !== undefined ? payload.packageIds : currentPackageIds;

    if (newPackageIds.length === 0) {
      throw new Error('Consolidation must contain at least one package');
    }

    // Removed packages
    const removedIds = currentPackageIds.filter((id) => !newPackageIds.includes(id));
    // Added packages
    const addedIds = newPackageIds.filter((id) => !currentPackageIds.includes(id));

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
    if (packages.length > 0) {
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
    }
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

    const inputConsolidationIds = payload.consolidationIds || payload.packageIds || [];

    // Fetch attached consolidations to calculate exact metrics & attached packages
    const consolidations = await Consolidation.findAll({
      where: {
        [Op.or]: [
          { id: inputConsolidationIds },
          { consolidationId: inputConsolidationIds }
        ]
      }
    });

    const totalWeightKg = consolidations.reduce((sum, c) => sum + (c.totalWeightKg || 0), 0);
    const totalCbm = consolidations.reduce((sum, c) => sum + (c.totalCbm || 0), 0);

    const allPackageIds = Array.from(
      new Set(consolidations.flatMap((c) => c.packageIds || []))
    );

    const validConsolidationUUIDs = consolidations.map((c) => c.id);

    const batch = await Batch.create({
      masterTrackingId,
      carrierName: payload.carrierName,
      flightVoyageNo: payload.flightVoyageNo,
      containerNo: payload.containerNo,
      shippingType: payload.shippingType,
      status: 'shipping_exported',
      consolidationIds: validConsolidationUUIDs,
      packageIds: allPackageIds,
      consolidationCount: validConsolidationUUIDs.length,
      packageCount: allPackageIds.length,
      totalWeightKg,
      totalCbm,
      departureDate: new Date(),
    });

    // Update status of batched consolidations & underlying packages
    if (validConsolidationUUIDs.length > 0) {
      await Consolidation.update({ status: 'batched' }, { where: { id: validConsolidationUUIDs } });

      if (allPackageIds.length > 0) {
        await Package.update(
          { status: 'shipped', shippedDate: new Date() },
          {
            where: {
              [Op.or]: [
                { id: allPackageIds },
                { trackingId: allPackageIds }
              ]
            }
          }
        );
      }

      // Notify all customers in the master batch (consolidations & packages)
      const customerIdsToNotify = new Set<string>();
      for (const c of consolidations) {
        if (c.customerId) customerIdsToNotify.add(c.customerId);
      }
      if (allPackageIds.length > 0) {
        const pkgs = await Package.findAll({ where: { id: allPackageIds } });
        pkgs.forEach((p) => { if (p.customerId) customerIdsToNotify.add(p.customerId); });
      }

      for (const custId of customerIdsToNotify) {
        NotificationService.sendOrderStatusNotification({
          userIdOrCustomerId: custId,
          orderType: 'Shipment',
          orderId: masterTrackingId,
          newStatus: 'shipped',
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
    let batch = await Batch.findByPk(batchId);
    if (!batch) {
      batch = await Batch.findOne({ where: { masterTrackingId: batchId } });
    }
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    const currentConsolidationIds = (batch as any).consolidationIds || [];
    const inputIds = packageIds || [];
    const mergedInputIds = [...new Set([...currentConsolidationIds, ...inputIds])];

    const consolidations = await Consolidation.findAll({
      where: {
        [Op.or]: [
          { id: mergedInputIds },
          { consolidationId: mergedInputIds }
        ]
      }
    });

    const totalWeightKg = consolidations.reduce((sum, c) => sum + (c.totalWeightKg || 0), 0);
    const totalCbm = consolidations.reduce((sum, c) => sum + (c.totalCbm || 0), 0);
    const allPackageIds = Array.from(
      new Set(consolidations.flatMap((c) => c.packageIds || []))
    );

    const validConsolidationUUIDs = consolidations.map((c) => c.id);

    (batch as any).consolidationIds = validConsolidationUUIDs;
    (batch as any).consolidationCount = validConsolidationUUIDs.length;
    (batch as any).packageIds = allPackageIds;
    (batch as any).packageCount = allPackageIds.length;
    (batch as any).totalWeightKg = totalWeightKg;
    (batch as any).totalCbm = totalCbm;
    await batch.save();

    // Mark consolidations as batched and packages as shipped
    if (validConsolidationUUIDs.length > 0) {
      await Consolidation.update({ status: 'batched' }, { where: { id: validConsolidationUUIDs } });
    }
    if (allPackageIds.length > 0) {
      await Package.update(
        { status: 'shipped', shippedDate: new Date() },
        {
          where: {
            [Op.or]: [
              { id: allPackageIds },
              { trackingId: allPackageIds }
            ]
          }
        }
      );
    }

    return batch;
  }

  public static async updateBatchStatus(
    batchId: string,
    status: string,
    extraOrAdmin?: any,
    adminUser?: any
  ) {
    let extra: { destinationWarehouse?: string; currentLocation?: string } = {};
    let admin = adminUser;
    
    if (extraOrAdmin && (extraOrAdmin.destinationWarehouse || extraOrAdmin.currentLocation)) {
      extra = extraOrAdmin;
    } else if (extraOrAdmin && extraOrAdmin.id) {
      admin = extraOrAdmin;
    }

    const batch = await Batch.findByPk(batchId);
    if (!batch) throw new Error('Batch not found');

    batch.status = status as any;
    if (extra.destinationWarehouse) {
      batch.destinationWarehouse = extra.destinationWarehouse;
    }
    if (extra.currentLocation) {
      batch.currentLocation = extra.currentLocation;
    }
    if (status === 'arrived_ng') batch.arrivedDate = new Date();
    await batch.save();

    const consolidationIds = batch.consolidationIds || [];
    const packageIds = batch.packageIds || [];
    const targetDestWh = extra.destinationWarehouse || batch.destinationWarehouse || 'Lagos Main Hub';

    // Propagate status to all attached consolidations and packages
    if (consolidationIds.length > 0) {
      await Consolidation.update(
        { status: status as any, destinationWarehouse: targetDestWh },
        { where: { id: consolidationIds } }
      );
    }
    if (packageIds.length > 0) {
      const updateData: any = { status };
      if (status === 'arrived_ng') updateData.arrivedDate = new Date();
      if (status === 'delivered') updateData.deliveredDate = new Date();
      await Package.update(updateData, { where: { id: packageIds } });
    }

    // Send multi-channel notifications to all customers in the master batch
    const customerIdsToNotify = new Set<string>();

    if (consolidationIds.length > 0) {
      const consolidations = await Consolidation.findAll({ where: { id: consolidationIds } });
      consolidations.forEach((c) => { if (c.customerId) customerIdsToNotify.add(c.customerId); });
    }

    if (packageIds.length > 0) {
      const pkgsInBatch = await Package.findAll({ where: { id: packageIds } });
      pkgsInBatch.forEach((p) => { if (p.customerId) customerIdsToNotify.add(p.customerId); });
    }

    const statusDescriptions: Record<string, string> = {
      shipped: `Master Batch ${batch.masterTrackingId} has departed China and is in transit to Nigeria.`,
      shipping_exported: `Master Batch ${batch.masterTrackingId} has departed China and is in transit to Nigeria.`,
      arrived_ng: `Master Batch ${batch.masterTrackingId} has arrived in Nigeria at ${targetDestWh}.`,
      customs_clearance: `Master Batch ${batch.masterTrackingId} is currently undergoing customs clearance.`,
      ready_for_delivery: `Master Batch ${batch.masterTrackingId} has cleared customs and is ready for delivery / pickup!`,
      delivered: `Master Batch ${batch.masterTrackingId} packages have been delivered.`,
      held_customs: `Master Batch ${batch.masterTrackingId} has been temporarily held at customs for inspection.`,
    };
    const desc = statusDescriptions[status] || `Master Batch ${batch.masterTrackingId} status updated to ${status}.`;

    for (const custId of customerIdsToNotify) {
      NotificationService.sendOrderStatusNotification({
        userIdOrCustomerId: custId,
        orderType: 'Shipment',
        orderId: batch.masterTrackingId,
        newStatus: status,
        statusDescription: desc,
      });
    }

    if (admin) {
      ActivityLogService.logActivity({
        userId: admin.id,
        userName: admin.name,
        userRole: admin.role,
        module: 'warehouse',
        action: 'UPDATE_BATCH_STATUS',
        description: `Updated Master Batch ${batch.masterTrackingId} status to ${status} (${targetDestWh})`,
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
    if (status === 'shipped' || status === 'shipping_exported') pkg.shippedDate = new Date();
    if (status === 'arrived_ng') pkg.arrivedDate = new Date();
    if (status === 'delivered') pkg.deliveredDate = new Date();
    if (extra?.weightKg !== undefined) pkg.weightKg = extra.weightKg;
    if (extra?.cbm !== undefined) pkg.cbm = extra.cbm;
    if (extra?.photos !== undefined) pkg.photos = extra.photos;

    await pkg.save();

    const descriptions: Record<string, string> = {
      order_created: 'Shipment order created and tracking registered.',
      pre_alerted: 'Package pre-alert tracking details recorded.',
      received_cn: 'Package physically received at China warehouse facility.',
      measured: `Package weight (${pkg.weightKg}kg) and CBM (${pkg.cbm} m³) measured.`,
      consolidating: 'Package queued for consolidation.',
      packed: 'Package securely packed for export shipment.',
      shipped: 'Package dispatched from China, in transit to Nigeria.',
      arrived_ng: 'Package landed in Nigeria and received at distribution hub.',
      customs_clearance: 'Package is undergoing customs inspection and duty clearance.',
      ready_for_delivery: 'Package has cleared customs and is ready for local delivery / hub pickup!',
      delivered: 'Package successfully delivered to customer.',
      held_customs: 'Package temporarily held at customs for inspection.',
      cancelled: 'Package shipment order has been cancelled.',
    };

    const statusDescription = descriptions[status] || `Package status updated to ${status}.`;

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: pkg.customerId,
      orderType: 'Shipment',
      orderId: pkg.trackingId || pkg.id,
      newStatus: status,
      statusDescription,
    });

    return pkg;
  }
}
