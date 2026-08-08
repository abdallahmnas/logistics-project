// Formatting utility functions

/**
 * Format amount as Nigerian Naira
 */
export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format amount as Chinese Yuan
 */
export const formatRmb = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format weight in KG
 */
export const formatWeight = (kg: number): string => {
  return `${kg.toFixed(2)} KG`;
};

/**
 * Format volume in CBM
 */
export const formatCbm = (cbm: number): string => {
  return `${cbm.toFixed(3)} CBM`;
};

/**
 * Format date to readable string
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

/**
 * Format date with time
 */
export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format relative time (e.g. "2 hours ago")
 */
export const formatRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

/**
 * Format phone number
 */
export const formatPhone = (phone: string): string => {
  // Basic Nigerian phone format
  if (phone.startsWith('+234')) {
    return phone.replace(/(\+234)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
  }
  return phone;
};

/**
 * Format tracking ID with prefix
 */
export const formatTrackingId = (id: string): string => {
  return id.toUpperCase();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format distance in KM
 */
export const formatDistance = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

/**
 * Generate a random ID (for mock data)
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
