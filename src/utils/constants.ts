// Application-wide constants

export const APP_NAME = 'Hamza RMB';
export const APP_TAGLINE = 'Bridging China & Nigeria';

// Warehouse addresses
export const WAREHOUSES = {
  guangzhou: {
    id: 'wh-gz',
    name: 'Guangzhou Inbound Hub',
    location: 'guangzhou' as const,
    address: 'Room 301, Building A, No. 88 Huanshi East Road, Yuexiu District, Guangzhou, Guangdong, China 510000',
    phone: '+86 138 0000 8888',
    email: 'warehouse.gz@hamzarmb.com',
    country: 'china' as const,
  },
  lagos: {
    id: 'wh-lag',
    name: 'Lagos Distribution Center',
    location: 'lagos' as const,
    address: '15 Balogun Street, Off Broad Street, Lagos Island, Lagos, Nigeria',
    phone: '+234 801 234 5678',
    email: 'warehouse.lag@hamzarmb.com',
    country: 'nigeria' as const,
  },
  abuja: {
    id: 'wh-abj',
    name: 'Abuja Distribution Center',
    location: 'abuja' as const,
    address: 'Plot 45, Cadastral Zone B06, Mabushi District, Abuja, FCT, Nigeria',
    phone: '+234 802 345 6789',
    email: 'warehouse.abj@hamzarmb.com',
    country: 'nigeria' as const,
  },
  kano: {
    id: 'wh-kan',
    name: 'Kano Distribution Center',
    location: 'kano' as const,
    address: '12 Bompai Road, Nassarawa GRA, Kano, Kano State, Nigeria',
    phone: '+234 803 456 7890',
    email: 'warehouse.kan@hamzarmb.com',
    country: 'nigeria' as const,
  },
};

// Shipping rates (per unit)
export const SHIPPING_RATES = {
  air: {
    perKg: 5500, // NGN per KG
    label: 'Air Freight',
    unit: 'KG',
    estimatedDays: '7-10',
  },
  sea: {
    perCbm: 180000, // NGN per CBM
    label: 'Sea Freight',
    unit: 'CBM',
    estimatedDays: '30-45',
  },
};

// Local delivery pricing
export const DELIVERY_RATES = {
  baseFare: {
    motorbike: 1500,
    sedan: 3000,
    box_truck: 8000,
  },
  perKm: {
    motorbike: 150,
    sedan: 250,
    box_truck: 500,
  },
};

// Platform exchange rate (mock)
export const DEFAULT_EXCHANGE_RATE = {
  platformRate: 215, // 1 CNY = 215 NGN
  buyRate: 213,
  sellRate: 217,
};

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Contact info
export const CONTACT = {
  email: 'support@hamzarmb.com',
  phone: '+234 800 HAMZA RMB',
  whatsapp: 'https://wa.me/2348012345678',
  address: '15 Balogun Street, Lagos Island, Lagos, Nigeria',
};

// Social links
export const SOCIALS = {
  twitter: 'https://twitter.com/hamzarmb',
  instagram: 'https://instagram.com/hamzarmb',
  facebook: 'https://facebook.com/hamzarmb',
  linkedin: 'https://linkedin.com/company/hamzarmb',
};
