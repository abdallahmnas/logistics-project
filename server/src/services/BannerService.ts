import { Banner } from '../models/Banner';
import { ActivityLogService } from './ActivityLogService';

const DEFAULT_BANNERS = [
  {
    title: 'Fast Air Cargo Special',
    subtitle: 'Guangzhou to Lagos in 3-5 days @ ₦12,500/kg',
    imageUrl: 'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=1000&auto=format&fit=crop&q=80',
    targetScreen: 'air_freight',
    displayOrder: 1,
    isActive: true,
  },
  {
    title: 'Instant RMB Supplier Payments',
    subtitle: 'Zero delay Alipay & WeChat transfers at live market rates',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1000&auto=format&fit=crop&q=80',
    targetScreen: 'exchange',
    displayOrder: 2,
    isActive: true,
  },
  {
    title: 'Save up to 40% on Consolidation',
    subtitle: 'Combine multiple package shipments into one single cargo batch',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
    targetScreen: 'consolidation',
    displayOrder: 3,
    isActive: true,
  },
];

export class BannerService {
  public static async initSeedBanners() {
    const count = await Banner.count();
    if (count === 0) {
      await Banner.bulkCreate(DEFAULT_BANNERS);
    }
  }

  public static async getActiveBanners() {
    await this.initSeedBanners();
    return Banner.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public static async getAllBannersAdmin() {
    await this.initSeedBanners();
    return Banner.findAll({
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
    });
  }

  public static async createBanner(
    data: {
      title: string;
      subtitle?: string;
      imageUrl: string;
      linkUrl?: string;
      targetScreen?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
    adminUser?: { id: string; name: string }
  ) {
    const banner = await Banner.create({
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      targetScreen: data.targetScreen || 'home',
      displayOrder: data.displayOrder !== undefined ? Number(data.displayOrder) : 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: 'admin',
        module: 'settings',
        action: 'CREATE_BANNER',
        description: `Created home sliding banner "${banner.title}"`,
        entityId: banner.id,
      });
    }

    return banner;
  }

  public static async updateBanner(
    id: string,
    data: Partial<{
      title: string;
      subtitle?: string;
      imageUrl?: string;
      linkUrl?: string;
      targetScreen?: string;
      displayOrder?: number;
      isActive?: boolean;
    }>,
    adminUser?: { id: string; name: string }
  ) {
    const banner = await Banner.findByPk(id);
    if (!banner) throw new Error('Banner not found');

    await banner.update(data);

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: 'admin',
        module: 'settings',
        action: 'UPDATE_BANNER',
        description: `Updated sliding banner "${banner.title}"`,
        entityId: banner.id,
      });
    }

    return banner;
  }

  public static async deleteBanner(id: string, adminUser?: { id: string; name: string }) {
    const banner = await Banner.findByPk(id);
    if (!banner) throw new Error('Banner not found');

    const title = banner.title;
    await banner.destroy();

    if (adminUser) {
      ActivityLogService.logActivity({
        userId: adminUser.id,
        userName: adminUser.name,
        userRole: 'admin',
        module: 'settings',
        action: 'DELETE_BANNER',
        description: `Deleted sliding banner "${title}"`,
        entityId: id,
      });
    }

    return true;
  }
}
