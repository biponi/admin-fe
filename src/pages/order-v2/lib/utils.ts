/**
 * Utility Functions for Order V2
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import type { IOrder, OrderStatus, DeliveryStatus } from '../types';

/**
 * Merge Tailwind classes with proper override
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date with different styles
 */
export function formatDate(date: string | Date, style: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  switch (style) {
    case 'short':
      return format(dateObj, 'MMM dd, yyyy');
    case 'long':
      return format(dateObj, 'MMMM dd, yyyy hh:mm a');
    case 'relative':
      return formatDistanceToNow(dateObj, { addSuffix: true });
    default:
      return format(dateObj, 'PP');
  }
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: OrderStatus | string): string {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    shipped: 'bg-purple-100 text-purple-800 border-purple-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    cancel: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-gray-100 text-gray-800 border-gray-200',
    return: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get delivery status color
 */
export function getDeliveryStatusColor(status: DeliveryStatus | string): string {
  const statusColors: Record<string, string> = {
    not_shipped: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    hold: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get fraud risk level color and badge
 */
export function getFraudRiskColor(level: 'green' | 'yellow' | 'red'): string {
  const colors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    red: 'bg-red-100 text-red-800 border-red-200',
  };

  return colors[level];
}

/**
 * Calculate order age in days
 */
export function getOrderAge(createdAt: string | Date): number {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get payment status
 */
export function getPaymentStatus(order: IOrder): 'paid' | 'partial' | 'unpaid' {
  if (order.paid === 0) return 'unpaid';
  if (order.paid >= order.totalPrice) return 'paid';
  return 'partial';
}

/**
 * Get payment status color
 */
export function getPaymentStatusColor(status: 'paid' | 'partial' | 'unpaid'): string {
  const colors = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    unpaid: 'bg-red-100 text-red-800 border-red-200',
  };

  return colors[status];
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate order number display
 */
export function formatOrderNumber(orderNumber: number): string {
  return `#${String(orderNumber).padStart(6, '0')}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Group orders by date
 */
export function groupOrdersByDate(orders: IOrder[]): Record<string, IOrder[]> {
  const grouped: Record<string, IOrder[]> = {};

  orders.forEach((order) => {
    const date = format(new Date(order.timestamps.createdAt), 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(order);
  });

  return grouped;
}

/**
 * Sort orders by different criteria
 */
export function sortOrders(
  orders: IOrder[],
  sortBy: 'date' | 'amount' | 'status' | 'orderNumber',
  order: 'asc' | 'desc' = 'desc'
): IOrder[] {
  const sorted = [...orders].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = new Date(a.timestamps.createdAt).getTime() - new Date(b.timestamps.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.totalPrice - b.totalPrice;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'orderNumber':
        comparison = a.orderNumber - b.orderNumber;
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Filter orders by search query
 */
export function filterOrdersBySearch(orders: IOrder[], query: string): IOrder[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return orders;

  return orders.filter((order) => {
    const orderNumber = formatOrderNumber(order.orderNumber).toLowerCase();
    const customerName = order.customer.name.toLowerCase();
    const customerPhone = order.customer.phoneNumber.toLowerCase();
    const status = order.status.toLowerCase();

    return (
      orderNumber.includes(lowerQuery) ||
      customerName.includes(lowerQuery) ||
      customerPhone.includes(lowerQuery) ||
      status.includes(lowerQuery)
    );
  });
}

/**
 * Validate phone number (Bangladesh format)
 */
export function isValidBDPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(?:\+88)?01[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{3})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Download JSON as file
 */
export function downloadJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
