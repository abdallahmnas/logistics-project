export type Permission =
  | 'shipments:read'
  | 'shipments:create'
  | 'shipments:scan'
  | 'shipments:batch'
  | 'procurement:read'
  | 'procurement:quote'
  | 'exchange:read'
  | 'exchange:verify'
  | 'delivery:read'
  | 'delivery:dispatch'
  | 'finance:read'
  | 'finance:rates'
  | 'staff:manage'
  | 'system:all';

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  super_admin: ['system:all'],
  admin: [
    'shipments:read',
    'shipments:create',
    'shipments:scan',
    'shipments:batch',
    'procurement:read',
    'procurement:quote',
    'exchange:read',
    'exchange:verify',
    'delivery:read',
    'delivery:dispatch',
    'finance:read',
    'finance:rates',
    'staff:manage',
  ],
  warehouse_cn: ['shipments:read', 'shipments:scan', 'shipments:batch'],
  warehouse_ng: ['shipments:read', 'delivery:read', 'delivery:dispatch'],
  procurement: ['procurement:read', 'procurement:quote'],
  finance: ['exchange:read', 'exchange:verify', 'finance:read', 'finance:rates'],
  driver: ['delivery:read', 'delivery:dispatch'],
  customer: ['shipments:read', 'shipments:create', 'procurement:read', 'exchange:read'],
};

export const hasPermission = (userRole?: string, permission?: Permission): boolean => {
  if (!userRole) return false;
  if (userRole === 'super_admin') return true;
  if (!permission) return true;

  const allowed = ROLE_PERMISSIONS[userRole] || [];
  return allowed.includes('system:all') || allowed.includes(permission);
};
