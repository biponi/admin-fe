/**
 * Commission status color scheme
 * Optimized for mobile displays and matches PDF export design
 */

export const statusColors = {
  paid: {
    bg: 'bg-green-100 dark:bg-green-900/50',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600',
    hex: '#10B981',
  },
  unpaid: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600',
    hex: '#EF4444',
  },
  pending: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/50',
    text: 'text-yellow-700 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600',
    hex: '#F59E0B',
  },
  hold: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/50',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600',
    hex: '#6366F1',
  },
  cancelled: {
    bg: 'bg-gray-100 dark:bg-gray-900/50',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600',
    hex: '#6B7280',
  },
  removed: {
    bg: 'bg-gray-50 dark:bg-gray-950/50',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-500',
    hex: '#9CA3AF',
  },
} as const;

export type CommissionStatus = keyof typeof statusColors;

/**
 * Get status colors for a given commission status
 */
export const getStatusColors = (status: string) => {
  return statusColors[status as CommissionStatus] || statusColors.cancelled;
};

/**
 * Get status background color class
 */
export const getStatusBgColor = (status: string) => {
  return getStatusColors(status).bg;
};

/**
 * Get status text color class
 */
export const getStatusTextColor = (status: string) => {
  return getStatusColors(status).text;
};

/**
 * Get status border color class
 */
export const getStatusBorderColor = (status: string) => {
  return getStatusColors(status).border;
};

/**
 * Get status icon color class
 */
export const getStatusIconColor = (status: string) => {
  return getStatusColors(status).icon;
};

/**
 * Get status hex color for charts/graphs
 */
export const getStatusHexColor = (status: string) => {
  return getStatusColors(status).hex;
};
