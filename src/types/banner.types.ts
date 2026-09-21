export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  targetScreen?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerState {
  activeBanners: Banner[];
  adminBanners: Banner[];
  loading: boolean;
  error: string | null;
}
