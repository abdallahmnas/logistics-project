import { DeliveryVehicle } from '../models/DeliveryVehicle';
import { ActivityLogService } from './ActivityLogService';

const DEFAULT_VEHICLES = [
  {
    name: 'Express Motorbike',
    type: 'motorbike',
    description: 'Fastest for light packages & documents up to 15kg.',
    priceLagos: 2500,
    priceKano: 2000,
    priceInterstate: 7500,
    perKmRate: 150,
    maxWeightKg: 15,
    imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500&auto=format&fit=crop&q=60',
    isActive: true,
  },
  {
    name: 'Standard Sedan / Car',
    type: 'sedan',
    description: 'Ideal for medium cartons & fragile items up to 60kg.',
    priceLagos: 5000,
    priceKano: 4500,
    priceInterstate: 15000,
    perKmRate: 250,
    maxWeightKg: 60,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=60',
    isActive: true,
  },
  {
    name: 'Cargo Van / Minibus',
    type: 'van',
    description: 'Spacious for multiple consolidated boxes & commercial goods up to 500kg.',
    priceLagos: 12000,
    priceKano: 10000,
    priceInterstate: 35000,
    perKmRate: 400,
    maxWeightKg: 500,
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&auto=format&fit=crop&q=60',
    isActive: true,
  },
  {
    name: 'Heavy Duty Haulage Truck',
    type: 'truck',
    description: 'Full pallet haulage for large commercial cargo & machinery up to 3000kg.',
    priceLagos: 35000,
    priceKano: 30000,
    priceInterstate: 95000,
    perKmRate: 750,
    maxWeightKg: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop&q=60',
    isActive: true,
  },
];

export class DeliveryVehicleService {
  public static async initSeedVehicles() {
    const count = await DeliveryVehicle.count();
    if (count === 0) {
      await DeliveryVehicle.bulkCreate(DEFAULT_VEHICLES);
    }
  }

  public static async getActiveVehicles() {
    await this.initSeedVehicles();
    return DeliveryVehicle.findAll({
      where: { isActive: true },
      order: [['priceLagos', 'ASC']],
    });
  }

  public static async getAllVehiclesAdmin() {
    await this.initSeedVehicles();
    return DeliveryVehicle.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  public static async createVehicle(
    data: {
      name: string;
      type: string;
      description?: string;
      priceLagos: number;
      priceKano: number;
      priceInterstate: number;
      perKmRate?: number;
      maxWeightKg?: number;
      imageUrl?: string;
      isActive?: boolean;
    },
    adminUser?: { id: string; name: string }
  ) {
    const vehicle = await DeliveryVehicle.create({
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: 'admin',
        module: 'delivery',
        action: 'CREATE_VEHICLE',
        description: `Created dispatch vehicle ${vehicle.name} (Lagos: ₦${vehicle.priceLagos}, Kano: ₦${vehicle.priceKano}, Interstate: ₦${vehicle.priceInterstate})`,
        entityId: vehicle.id,
      });
    }

    return vehicle;
  }

  public static async updateVehicle(
    id: string,
    data: Partial<{
      name: string;
      type: string;
      description?: string;
      priceLagos: number;
      priceKano: number;
      priceInterstate: number;
      perKmRate?: number;
      maxWeightKg?: number;
      imageUrl?: string;
      isActive?: boolean;
    }>,
    adminUser?: { id: string; name: string }
  ) {
    const vehicle = await DeliveryVehicle.findByPk(id);
    if (!vehicle) throw new Error('Delivery vehicle not found');

    await vehicle.update(data);

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: 'admin',
        module: 'delivery',
        action: 'UPDATE_VEHICLE',
        description: `Updated dispatch vehicle ${vehicle.name} pricing & parameters`,
        entityId: vehicle.id,
      });
    }

    return vehicle;
  }

  public static async deleteVehicle(id: string, adminUser?: { id: string; name: string }) {
    const vehicle = await DeliveryVehicle.findByPk(id);
    if (!vehicle) throw new Error('Delivery vehicle not found');

    await vehicle.destroy();

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: 'admin',
        module: 'delivery',
        action: 'DELETE_VEHICLE',
        description: `Deleted dispatch vehicle ${vehicle.name}`,
        entityId: id,
      });
    }

    return true;
  }
}
