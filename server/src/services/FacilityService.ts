import { Facility, FacilityAttributes } from '../models';
import { ActivityLogService } from './ActivityLogService';

export class FacilityService {
  public static async getAllFacilities() {
    let facilities = await Facility.findAll({ order: [['code', 'ASC']] });

    // Seed defaults if empty
    if (facilities.length === 0) {
      await Facility.bulkCreate([
        {
          code: 'CN-CAN-01',
          name: 'Guangzhou Primary Hub',
          location: 'Guangzhou, China',
          country: 'CN',
          type: 'regional_hub',
          status: 'active',
          capacityUtilization: 45,
          currentVolume: '450 packages',
          maxVolume: '1,000 pkgs/day',
          address: 'No. 88 Baiyun Cargo Road, Guangzhou, China',
          contactName: 'Chen Wei',
          contactPhone: '+86 20 8888 9999',
          contactEmail: 'guangzhou@logicore.com',
          imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
        },
        {
          code: 'NG-LOS-01',
          name: 'Lagos Central Distribution Hub',
          location: 'Lagos, Nigeria',
          country: 'NG',
          type: 'regional_hub',
          status: 'active',
          capacityUtilization: 60,
          currentVolume: '300 packages',
          maxVolume: '500 pkgs/day',
          address: '12 Commercial Avenue, Ikeja, Lagos, Nigeria',
          contactName: 'Emeka Nwosu',
          contactPhone: '+234 802 123 4567',
          contactEmail: 'lagos@logicore.com',
          imageUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop',
        },
        {
          code: 'NG-ABJ-02',
          name: 'Abuja Express Station',
          location: 'Abuja, Nigeria',
          country: 'NG',
          type: 'dist_center',
          status: 'active',
          capacityUtilization: 35,
          currentVolume: '105 packages',
          maxVolume: '300 pkgs/day',
          address: 'Plot 402 Central Business District, Abuja, Nigeria',
          contactName: 'Aisha Bello',
          contactPhone: '+234 803 987 6543',
          contactEmail: 'abuja@logicore.com',
          imageUrl: 'https://images.unsplash.com/photo-1580674684081-776d3f27f292?q=80&w=2070&auto=format&fit=crop',
        },
      ]);
      facilities = await Facility.findAll({ order: [['code', 'ASC']] });
    }

    return facilities;
  }

  public static async getFacilityById(id: string) {
    const facility = await Facility.findByPk(id);
    if (!facility) throw new Error('Facility not found');
    return facility;
  }

  public static async createFacility(payload: Partial<FacilityAttributes>, adminUser?: { id: string; name: string; role: string }) {
    if (!payload.code || !payload.name || !payload.location) {
      throw new Error('Code, Name, and Location are required');
    }

    const existing = await Facility.findOne({ where: { code: payload.code } });
    if (existing) {
      throw new Error(`Facility code ${payload.code} already exists`);
    }

    const facility = await Facility.create({
      code: payload.code,
      name: payload.name,
      location: payload.location,
      country: payload.country || 'NG',
      type: payload.type || 'regional_hub',
      status: payload.status || 'active',
      capacityUtilization: payload.capacityUtilization || 10,
      currentVolume: payload.currentVolume || '0 packages',
      maxVolume: payload.maxVolume || '500 pkgs/day',
      address: payload.address,
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      contactEmail: payload.contactEmail,
      imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
    });

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        module: 'warehouse',
        action: 'CREATE_FACILITY',
        description: `Provisioned new facility ${facility.code} (${facility.name})`,
        entityId: facility.id,
      });
    }

    return facility;
  }

  public static async updateFacility(id: string, payload: Partial<FacilityAttributes>, adminUser?: { id: string; name: string; role: string }) {
    const facility = await Facility.findByPk(id);
    if (!facility) throw new Error('Facility not found');

    if (payload.code && payload.code !== facility.code) {
      const existing = await Facility.findOne({ where: { code: payload.code } });
      if (existing) throw new Error(`Facility code ${payload.code} already exists`);
    }

    await facility.update(payload);

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        module: 'warehouse',
        action: 'UPDATE_FACILITY',
        description: `Updated facility details for ${facility.code} (${facility.name})`,
        entityId: facility.id,
      });
    }

    return facility;
  }

  public static async deleteFacility(id: string, adminUser?: { id: string; name: string; role: string }) {
    const facility = await Facility.findByPk(id);
    if (!facility) throw new Error('Facility not found');

    const code = facility.code;
    const name = facility.name;

    await facility.destroy();

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: adminUser.role,
        module: 'warehouse',
        action: 'DELETE_FACILITY',
        description: `Decommissioned facility ${code} (${name})`,
        entityId: id,
      });
    }

    return { success: true, message: `Facility ${code} deleted` };
  }
}
