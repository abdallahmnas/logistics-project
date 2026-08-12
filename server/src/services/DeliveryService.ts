import { LocalDelivery, User } from '../models';

export class DeliveryService {
  public static async createDelivery(userId: string, payload: {
    pickupAddress: string;
    pickupCity: string;
    pickupPhone: string;
    pickupContactName: string;
    dropoffAddress: string;
    dropoffCity: string;
    dropoffPhone: string;
    dropoffContactName: string;
    packageDescription: string;
    vehicleType: 'motorbike' | 'sedan' | 'box_truck';
    paymentMethod: 'wallet' | 'cash_on_delivery';
  }) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const rates = { motorbike: { base: 1500, perKm: 150 }, sedan: { base: 3000, perKm: 250 }, box_truck: { base: 8000, perKm: 500 } };
    const r = rates[payload.vehicleType] || rates.sedan;
    const distanceKm = 15;
    const baseFare = r.base;
    const distanceFee = distanceKm * r.perKm;
    const totalFee = baseFare + distanceFee;

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
      vehicleType: payload.vehicleType,
      distanceKm,
      baseFare,
      distanceFee,
      totalFee,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === 'wallet' ? 'paid' : 'unpaid',
      requestedAt: new Date(),
    });
    return delivery;
  }

  public static async getDeliveries(customerId?: string) {
    if (customerId) return LocalDelivery.findAll({ where: { customerId }, order: [['createdAt', 'DESC']] });
    return LocalDelivery.findAll({ order: [['createdAt', 'DESC']] });
  }

  public static async assignDriver(id: string, payload: { driverName: string; driverPhone: string; driverId?: string }) {
    const del = await LocalDelivery.findByPk(id);
    if (!del) throw new Error('Delivery not found');

    del.driverId = payload.driverId || `drv-${Date.now()}`;
    del.driverName = payload.driverName;
    del.driverPhone = payload.driverPhone;
    del.status = 'driver_assigned';
    del.verificationPin = String(Math.floor(1000 + Math.random() * 9000));
    del.confirmedAt = new Date();

    await del.save();
    return del;
  }

  public static async updateStatus(id: string, status: string) {
    const del = await LocalDelivery.findByPk(id);
    if (!del) throw new Error('Delivery not found');

    const allowed = ['pending', 'confirmed', 'driver_assigned', 'in_transit', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) throw new Error(`Invalid status: ${status}`);

    (del as any).status = status;
    if (status === 'in_transit') (del as any).pickedUpAt = new Date();
    if (status === 'delivered') (del as any).deliveredAt = new Date();
    await del.save();
    return del;
  }
}
