import { Request, Response } from 'express';

import { SettingsService } from '../services/SettingsService';

export const getMetadataOptions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await SettingsService.getSettings();

    const metaData = {
      supportTickets: {
        categories: ['shipment', 'payment', 'exchange', 'procurement', 'delivery', 'account', 'other'],
        statuses: ['open', 'in_progress', 'resolved', 'closed'],
        priorities: ['low', 'medium', 'high', 'urgent'],
      },
      procurements: {
        statuses: ['submitted', 'under_review', 'quoted', 'approved', 'purchasing', 'shipped_to_wh', 'received_at_wh', 'cancelled', 'rejected'],
      },
      exchanges: {
        statuses: ['pending', 'awaiting_payment', 'receipt_uploaded', 'naira_confirmed', 'rmb_released', 'completed', 'cancelled', 'disputed'],
        directions: ['ngn_to_rmb', 'rmb_to_ngn'],
        destTypes: ['alipay', 'wechat_pay', 'chinese_bank'],
      },
      deliveries: {
        statuses: ['pending', 'confirmed', 'driver_assigned', 'out_for_pickup', 'in_transit', 'delivered', 'cancelled', 'failed'],
        vehicleTypes: ['motorbike', 'sedan', 'box_truck'],
        paymentMethods: ['wallet', 'cash_on_delivery'],
      },
      shipments: {
        packageStatuses: ['pending_arrival', 'received_cn', 'consolidated', 'in_batch', 'shipped', 'received_ng', 'ready_for_pickup', 'delivered'],
        batchStatuses: ['draft', 'open', 'manifested', 'shipped', 'in_customs', 'arrived_destination', 'completed'],
        shippingMethods: ['air', 'sea', 'express'],
      },
      shippingThresholds: {
        minAirFreightKg: settings.minAirFreightKg ?? 1.0,
        minSeaFreightCbm: settings.minSeaFreightCbm ?? 0.1,
        airFreightRatePerKg: settings.airFreightRatePerKg ?? 12500,
        seaFreightRatePerCbm: settings.seaFreightRatePerCbm ?? 450000,
        seaFreightRatePerKg: settings.seaFreightRatePerKg ?? 3500,
      },
      users: {
        roles: ['customer', 'super_admin', 'admin', 'warehouse_cn', 'warehouse_ng', 'procurement', 'finance', 'clearance_agent', 'driver'],
      },
      banners: {
        targetTypes: ['none', 'screen', 'url'],
      },
    };

    res.status(200).json({
      success: true,
      data: metaData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
