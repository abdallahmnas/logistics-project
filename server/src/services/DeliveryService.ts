import { LocalDelivery, User, Wallet } from '../models';
import { DeliveryVehicle } from '../models/DeliveryVehicle';
import { DeliveryVehicleService } from './DeliveryVehicleService';
import { ActivityLogService } from './ActivityLogService';
import { NotificationService } from './NotificationService';

export class DeliveryService {
  public static async createDelivery(
    userId: string,
    payload: {
      pickupAddress: string;
      pickupCity: string;
      pickupPhone: string;
      pickupContactName: string;
      dropoffAddress: string;
      dropoffCity: string;
      dropoffPhone: string;
      dropoffContactName: string;
      packageDescription: string;
      vehicleId?: string;
      vehicleType?: string;
      paymentMethod: 'wallet' | 'cash_on_delivery';
    }
  ) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User account not found');

    let vehicle: DeliveryVehicle | null = null;

    if (payload.vehicleId) {
      vehicle = await DeliveryVehicle.findByPk(payload.vehicleId);
    }

    if (!vehicle && payload.vehicleType) {
      vehicle = await DeliveryVehicle.findOne({ where: { type: payload.vehicleType, isActive: true } });
    }

    if (!vehicle) {
      const activeVehicles = await DeliveryVehicleService.getActiveVehicles();
      vehicle = activeVehicles[0];
    }

    if (!vehicle) {
      throw new Error('No active delivery vehicles available. Please contact support.');
    }

    const dropoffCityLower = (payload.dropoffCity || '').toLowerCase().trim();
    const pickupCityLower = (payload.pickupCity || '').toLowerCase().trim();

    let totalFee = vehicle.priceInterstate; // Default to Interstate

    const isLagos = dropoffCityLower.includes('lagos') || pickupCityLower.includes('lagos');
    const isKano = dropoffCityLower.includes('kano') || pickupCityLower.includes('kano');

    if (isLagos && isKano) {
      totalFee = vehicle.priceInterstate;
    } else if (isLagos) {
      totalFee = vehicle.priceLagos;
    } else if (isKano) {
      totalFee = vehicle.priceKano;
    } else {
      totalFee = vehicle.priceInterstate;
    }

    let paymentStatus: 'unpaid' | 'paid' = 'unpaid';

    if (payload.paymentMethod === 'wallet') {
      let wallet = await Wallet.findOne({ where: { userId: user.id } });
      const currentBalance = wallet ? Number(wallet.balance) : 0;

      if (currentBalance < totalFee) {
        throw new Error(
          `Insufficient wallet balance. Total fee for ${vehicle.name} (${isLagos ? 'Lagos' : isKano ? 'Kano' : 'Inter-state'}) is ₦${totalFee.toLocaleString()}, but your balance is ₦${currentBalance.toLocaleString()}. Please top up your wallet.`
        );
      }

      if (wallet) {
        wallet.balance = Number(wallet.balance) - totalFee;
        wallet.availableBalance = wallet.balance - Number(wallet.escrowHeld || 0);
        await wallet.save();
      }
      paymentStatus = 'paid';
    }

    const delivery = await LocalDelivery.create({
      customerId: user.customerId,
      customerName: `${user.firstName} ${user.lastName}`,
      status: 'pending',
      pickupAddress: payload.pickupAddress,
      pickupCity: payload.pickupCity,
      pickupPhone: payload.pickupPhone,
      pickupContactName: payload.pickupContactName,
      dropoffAddress: payload.dropoffAddress,
      dropoffCity: payload.dropoffCity,
      dropoffPhone: payload.dropoffPhone,
      dropoffContactName: payload.dropoffContactName,
      packageDescription: payload.packageDescription,
      vehicleType: vehicle.type || 'sedan',
      distanceKm: 15,
      baseFare: totalFee,
      distanceFee: 0,
      totalFee,
      paymentMethod: payload.paymentMethod,
      paymentStatus,
      requestedAt: new Date(),
    });

    ActivityLogService.logActivity({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userRole: user.role,
      module: 'delivery',
      action: 'CREATE_DELIVERY',
      description: `Requested doorstep dispatch via ${vehicle.name} to ${payload.dropoffAddress} (${payload.dropoffCity}). Fee: ₦${totalFee.toLocaleString()}`,
      entityId: delivery.id,
    });

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: user.id,
      orderType: 'Local Delivery',
      orderId: delivery.id.slice(0, 8),
      newStatus: 'pending',
      statusDescription: `Doorstep delivery requested (${vehicle.name}) to ${payload.dropoffAddress}. Total fare: ₦${totalFee.toLocaleString()}.`,
    });

    return delivery;
  }

  public static async getDeliveries(customerId?: string) {
    if (customerId) return LocalDelivery.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return LocalDelivery.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async assignDriver(
    id: string,
    payload: { driverName: string; driverPhone: string; driverId?: string }
  ) {
    const del = await LocalDelivery.findByPk(id);
    if (!del) throw new Error('Delivery record not found');

    del.driverId = payload.driverId || `drv-${Date.now()}`;
    del.driverName = payload.driverName;
    del.driverPhone = payload.driverPhone;
    del.status = 'driver_assigned';
    del.verificationPin = String(Math.floor(1000 + Math.random() * 9000));
    del.confirmedAt = new Date();

    await del.save();

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: del.customerId,
      orderType: 'Local Delivery',
      orderId: del.id.slice(0, 8),
      newStatus: 'driver_assigned',
      statusDescription: `Driver ${payload.driverName} (${payload.driverPhone}) assigned. Your 4-digit pickup PIN is ${del.verificationPin}.`,
    });

    return del;
  }

  public static async updateStatus(
    id: string,
    status: string,
    extraInfo?: { notes?: string; driverName?: string; driverPhone?: string }
  ) {
    const del = await LocalDelivery.findByPk(id);
    if (!del) throw new Error('Delivery record not found');

    const allowed = ['pending', 'confirmed', 'driver_assigned', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error(`Invalid delivery status: ${status}`);

    (del as any).status = status;
    if (extraInfo?.driverName) del.driverName = extraInfo.driverName;
    if (extraInfo?.driverPhone) del.driverPhone = extraInfo.driverPhone;
    if (status === 'in_transit') (del as any).pickedUpAt = new Date();
    if (status === 'delivered') (del as any).deliveredAt = new Date();

    await del.save();

    const statusMap: Record<string, string> = {
      pending: 'Pending Driver Assignment',
      confirmed: 'Order Confirmed',
      driver_assigned: `Driver Assigned (${del.driverName || 'Dispatch Driver'})`,
      in_transit: 'Package Picked Up & In-Transit',
      out_for_delivery: 'Out for Doorstep Delivery',
      delivered: 'Package Successfully Delivered',
      cancelled: 'Delivery Order Cancelled',
    };

    const statusDesc = statusMap[status] || `Local delivery status updated to ${status}`;
    const fullDesc = extraInfo?.notes ? `${statusDesc}. Note: ${extraInfo.notes}` : statusDesc;

    NotificationService.sendOrderStatusNotification({
      userIdOrCustomerId: del.customerId,
      orderType: 'Local Delivery',
      orderId: del.id.slice(0, 8),
      newStatus: status,
      statusDescription: fullDesc,
    });

    return del;
  }
}
