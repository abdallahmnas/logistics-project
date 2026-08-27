import { PermissionGroup, Permission } from '../models';
import { PermissionService } from './PermissionService';

export class SeedPermissionService {
  public static async seedDefaultGroups() {
    try {
      const defaultGroups = [
        {
          name: 'Super Admin',
          title: 'Super Admin',
          description: 'Full system management and administrative control',
          status: 'active',
          permissions: {
            shipment: { create: true, read: true, update: true, delete: true, approve: true },
            warehouse: { create: true, read: true, update: true, delete: true },
            procurement: { create: true, read: true, update: true, approve: true, reject: true },
            exchange: { create: true, read: true, update: true, approve: true, reject: true },
            delivery: { create: true, read: true, update: true, delete: true },
            staff: { create: true, read: true, update: true, delete: true },
            support: { create: true, read: true, update: true, delete: true },
          },
        },
        {
          name: 'Warehouse (China Hub)',
          title: 'Warehouse (China Hub)',
          description: 'Scan inbound packages, weigh, and build master batches in Guangzhou/Yiwu',
          status: 'active',
          permissions: {
            shipment: { create: true, read: true, update: true, update_status: true },
            warehouse: { create: true, read: true, update: true },
          },
        },
        {
          name: 'Warehouse (Nigeria Hub)',
          title: 'Warehouse (Nigeria Hub)',
          description: 'Process incoming containers, customs clearance, and local dispatch in Lagos/Kano',
          status: 'active',
          permissions: {
            shipment: { read: true, update: true, update_status: true },
            warehouse: { read: true, update: true },
            delivery: { create: true, read: true, update: true },
          },
        },
        {
          name: 'Procurement Specialist',
          title: 'Procurement Specialist',
          description: 'Review "Buy For Me" requests and issue supplier quotes on 1688/Taobao',
          status: 'active',
          permissions: {
            procurement: { read: true, update: true, approve: true, reject: true },
          },
        },
        {
          name: 'Finance Manager',
          title: 'Finance Manager',
          description: 'Verify exchange payments and process RMB transfers to supplier accounts',
          status: 'active',
          permissions: {
            exchange: { read: true, update: true, approve: true, reject: true },
            wallet: { read: true, credit: true, debit: true },
          },
        },
        {
          name: 'Clearance Agent',
          title: 'Clearance Agent',
          description: 'Inspect customs documentation and update clearance status at port',
          status: 'active',
          permissions: {
            shipment: { read: true, update_status: true },
            delivery: { read: true },
          },
        },
        {
          name: 'Logistics Driver',
          title: 'Logistics Driver',
          description: 'Receive local delivery dispatch tasks and verification PINs for final handoff',
          status: 'active',
          permissions: {
            delivery: { read: true, update_status: true },
          },
        },
      ];

      for (const groupData of defaultGroups) {
        const [group] = await PermissionGroup.findOrCreate({
          where: { name: groupData.name },
          defaults: {
            name: groupData.name,
            title: groupData.title,
            description: groupData.description,
            status: groupData.status as any,
            isActive: true,
            permissions: groupData.permissions,
          },
        });

        // Sync rules matrix into discrete permissions records
        await PermissionService.syncMatrixToRules(group.id, groupData.permissions);
      }

      console.log('[SeedPermissionService] Default permission groups and matrix rules seeded successfully.');
    } catch (err: any) {
      console.error('[SeedPermissionService] Error seeding default permission groups:', err.message);
    }
  }
}
