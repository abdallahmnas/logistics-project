import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {
  sequelize,
  User,
  Wallet,
  WalletTransaction,
  Package,
  Consolidation,
  Batch,
  ProcurementRequest,
  ExchangeRate,
  ExchangeRequest,
  LocalDelivery,
  Notification,
} from '../models/index';
import {
  seedUsers,
  seedWallet,
  seedTransactions,
  seedPackages,
  seedConsolidations,
  seedBatches,
  seedProcurements,
  seedExchangeRate,
  seedExchanges,
  seedDeliveries,
  seedNotifications,
} from './seedData';

import { SeedPermissionService } from '../services/SeedPermissionService';

dotenv.config();

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  try {
    // Sync tables (force clean sync for seeding)
    await sequelize.sync({ force: true });
    console.log('✅ Database schema synchronized.');

    // 0. Seed Permission Groups & Operational Rules
    await SeedPermissionService.seedDefaultGroups();
    const { PermissionGroup } = await import('../models/index');

    // 1. Seed Users & Wallets
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('12345678', salt);

    for (const u of seedUsers) {
      let permissionGroupId: string | undefined = undefined;
      if (u.groupName) {
        const group = await PermissionGroup.findOne({ where: { title: u.groupName } }) || await PermissionGroup.findOne({ where: { name: u.groupName } });
        if (group) permissionGroupId = group.id;
      }

      const user = await User.create({
        id: u.id,
        customerId: u.customerId,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        role: u.role as any,
        passwordHash: defaultPasswordHash,
        isVerified: u.isVerified,
        permissionGroupId,
      });

      if (u.role === 'customer' && u.id === seedWallet.customerId) {
        await Wallet.create({
          id: seedWallet.id,
          userId: user.id,
          balance: seedWallet.balance,
          currency: seedWallet.currency,
          escrowHeld: seedWallet.escrowHeld,
          availableBalance: seedWallet.availableBalance,
          lastTopUpAt: seedWallet.lastTopUpAt ? new Date(seedWallet.lastTopUpAt) : undefined,
        });
      } else {
        await Wallet.create({
          userId: user.id,
          balance: 500000,
          currency: 'NGN',
          escrowHeld: 0,
          availableBalance: 500000,
        });
      }
    }
    console.log(`✅ Seeded ${seedUsers.length} Users with RBAC Groups and default Wallets.`);

    // 2. Seed Wallet Transactions
    for (const txn of seedTransactions) {
      await WalletTransaction.create({
        id: txn.id,
        customerId: txn.customerId,
        type: txn.type as any,
        category: txn.category as any,
        amount: txn.amount,
        currency: txn.currency,
        balanceAfter: txn.balanceAfter,
        description: txn.description,
        referenceId: txn.referenceId,
      });
    }
    console.log(`✅ Seeded ${seedTransactions.length} Wallet Transactions.`);

    // 3. Seed Packages
    for (const pkg of seedPackages) {
      await Package.create({
        id: pkg.id,
        trackingId: pkg.trackingId,
        chineseTrackingNo: pkg.chineseTrackingNo,
        customerId: pkg.customerId,
        customerName: pkg.customerName,
        status: pkg.status as any,
        description: pkg.description,
        weightKg: pkg.weightKg,
        cbm: pkg.cbm,
        dimensions: pkg.dimensions,
        photos: pkg.photos || [],
        linkedBatchId: pkg.linkedBatchId,
        shippingMethod: pkg.shippingMethod as any,
        destinationWarehouse: pkg.destinationWarehouse as any,
        invoiceAmount: pkg.invoiceAmount,
        paymentMethod: pkg.paymentMethod as any,
        paymentStatus: pkg.paymentStatus as any,
        preAlertDate: pkg.preAlertDate ? new Date(pkg.preAlertDate) : new Date(),
        receivedDate: pkg.receivedDate ? new Date(pkg.receivedDate) : undefined,
        shippedDate: pkg.shippedDate ? new Date(pkg.shippedDate) : undefined,
        arrivedDate: pkg.arrivedDate ? new Date(pkg.arrivedDate) : undefined,
        deliveredDate: pkg.deliveredDate ? new Date(pkg.deliveredDate) : undefined,
      });
    }
    console.log(`✅ Seeded ${seedPackages.length} Packages.`);

    // 4. Seed Consolidations
    for (const cons of seedConsolidations) {
      await Consolidation.create({
        id: cons.id,
        consolidationId: cons.consolidationId,
        customerId: cons.customerId,
        customerName: cons.customerName,
        packageIds: cons.packageIds,
        shippingMethod: cons.shippingMethod as any,
        destinationWarehouse: cons.destinationWarehouse as any,
        paymentMethod: cons.paymentMethod as any,
        totalWeightKg: cons.totalWeightKg,
        totalCbm: cons.totalCbm,
        shippingFee: cons.shippingFee,
        status: cons.status as any,
      });
    }
    console.log(`✅ Seeded ${seedConsolidations.length} Consolidations.`);

    // 5. Seed Batches
    for (const batch of seedBatches) {
      await Batch.create({
        id: batch.id,
        masterTrackingId: batch.masterTrackingId,
        carrierName: batch.carrierName,
        flightVoyageNo: batch.flightVoyageNo,
        containerNo: batch.containerNo,
        shippingType: batch.shippingType as any,
        status: batch.status as any,
        packageIds: batch.packageIds,
        packageCount: batch.packageCount,
        totalWeightKg: batch.totalWeightKg,
        totalCbm: batch.totalCbm,
        departureDate: batch.departureDate ? new Date(batch.departureDate) : undefined,
        expectedArrivalDate: batch.expectedArrivalDate ? new Date(batch.expectedArrivalDate) : undefined,
        actualArrivalDate: batch.actualArrivalDate ? new Date(batch.actualArrivalDate) : undefined,
      });
    }
    console.log(`✅ Seeded ${seedBatches.length} Master Batches.`);

    // 6. Seed Procurements
    for (const proc of seedProcurements) {
      await ProcurementRequest.create({
        id: proc.id,
        customerId: proc.customerId,
        customerName: proc.customerName,
        productUrl: proc.productUrl || (proc as any).supplierUrl || 'https://detail.1688.com/offer/674829102.html',
        productPhotos: proc.productPhotos || [],
        quantity: proc.quantity,
        specifications: proc.specifications,
        sizes: proc.sizes,
        colors: proc.colors,
        variations: proc.variations,
        notes: proc.notes,
        status: proc.status as any,
        productCostRmb: proc.productCostRmb,
        serviceFeeRmb: proc.serviceFeeRmb,
        totalCostRmb: proc.totalCostRmb,
        exchangeRateUsed: proc.exchangeRateUsed,
        totalCostNaira: proc.totalCostNaira,
        supplierName: proc.supplierName,
        chineseTrackingNo: proc.chineseTrackingNo,
        linkedShipmentId: proc.linkedShipmentId,
        submittedAt: new Date(proc.submittedAt),
        quotedAt: proc.quotedAt ? new Date(proc.quotedAt) : undefined,
        approvedAt: proc.approvedAt ? new Date(proc.approvedAt) : undefined,
        purchasedAt: proc.purchasedAt ? new Date(proc.purchasedAt) : undefined,
      });
    }
    console.log(`✅ Seeded ${seedProcurements.length} Procurement Requests.`);

    // 7. Seed Exchange Rate & Exchange Requests
    await ExchangeRate.create({
      id: seedExchangeRate.id,
      buyRate: seedExchangeRate.buyRate || 215.0,
      sellRate: seedExchangeRate.sellRate || 225.0,
      platformRate: seedExchangeRate.platformRate || 220.0,
      effectiveFrom: (seedExchangeRate as any).effectiveFrom ? new Date((seedExchangeRate as any).effectiveFrom) : new Date(),
      isActive: seedExchangeRate.isActive,
    });

    for (const exch of seedExchanges) {
      await ExchangeRequest.create({
        id: exch.id,
        customerId: exch.customerId,
        customerName: exch.customerName,
        amountNaira: exch.amountNaira,
        amountRmb: exch.amountRmb,
        exchangeRate: (exch as any).exchangeRate || (exch as any).exchangeRateUsed || 220,
        platformFee: (exch as any).platformFee || 2500,
        totalNaira: (exch as any).totalNaira || exch.amountNaira,
        status: exch.status as any,
        escrowBankName: (exch as any).escrowBankName || 'Guaranty Trust Bank',
        escrowAccountNo: (exch as any).escrowAccountNo || '0123456789',
        escrowAccountName: (exch as any).escrowAccountName || 'Hamza RMB Global Escrow',
        nairaReceiptUrl: (exch as any).nairaReceiptUrl,
        rmbDestType: (exch as any).rmbDestType || 'alipay',
        rmbDestAccount: (exch as any).rmbDestAccount || 'supplier@alipay.cn',
        rmbDestName: (exch as any).rmbDestName || 'Guangzhou Supplier',
        rmbDestQrCode: (exch as any).rmbDestQrCode,
        rmbReceiptUrl: (exch as any).rmbReceiptUrl,
        requestedAt: (exch as any).requestedAt ? new Date((exch as any).requestedAt) : new Date(),
        nairaConfirmedAt: (exch as any).nairaConfirmedAt ? new Date((exch as any).nairaConfirmedAt) : undefined,
        rmbReleasedAt: (exch as any).rmbReleasedAt ? new Date((exch as any).rmbReleasedAt) : undefined,
        completedAt: (exch as any).completedAt ? new Date((exch as any).completedAt) : undefined,
        expiresAt: (exch as any).expiresAt ? new Date((exch as any).expiresAt) : new Date(Date.now() + 86400000),
      });
    }
    console.log(`✅ Seeded Exchange Rate and ${seedExchanges.length} Exchange Requests.`);

    // 8. Seed Local Deliveries
    for (const del of seedDeliveries) {
      await LocalDelivery.create({
        id: del.id,
        customerId: del.customerId,
        customerName: del.customerName,
        status: del.status as any,
        pickupAddress: del.pickupAddress,
        pickupCity: del.pickupCity,
        pickupPhone: del.pickupPhone,
        pickupContactName: del.pickupContactName,
        dropoffAddress: del.dropoffAddress,
        dropoffCity: del.dropoffCity,
        dropoffPhone: del.dropoffPhone,
        dropoffContactName: del.dropoffContactName,
        packageDescription: del.packageDescription,
        packagePhotos: del.packagePhotos || [],
        handlingInstructions: del.handlingInstructions,
        estimatedWeightKg: del.estimatedWeightKg,
        vehicleType: del.vehicleType as any,
        distanceKm: del.distanceKm,
        baseFare: del.baseFare,
        distanceFee: del.distanceFee,
        totalFee: del.totalFee,
        paymentMethod: del.paymentMethod as any,
        paymentStatus: del.paymentStatus as any,
        driverId: del.driverId,
        driverName: del.driverName,
        driverPhone: del.driverPhone,
        verificationPin: del.verificationPin,
        requestedAt: new Date(del.requestedAt),
        confirmedAt: del.confirmedAt ? new Date(del.confirmedAt) : undefined,
        pickedUpAt: del.pickedUpAt ? new Date(del.pickedUpAt) : undefined,
        deliveredAt: del.deliveredAt ? new Date(del.deliveredAt) : undefined,
      });
    }
    console.log(`✅ Seeded ${seedDeliveries.length} Local Deliveries.`);

    // 9. Seed Notifications
    for (const notif of seedNotifications) {
      await Notification.create({
        id: notif.id,
        userId: notif.userId,
        title: notif.title,
        message: notif.message,
        type: notif.type as any,
        isRead: notif.isRead,
        referenceId: notif.referenceId,
      });
    }
    console.log(`✅ Seeded ${seedNotifications.length} Notifications.`);

    console.log('🚀 Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();
