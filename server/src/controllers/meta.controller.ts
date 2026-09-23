import { Request, Response } from 'express';

export const getMetadataOptions = (_req: Request, res: Response): void => {
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
};
