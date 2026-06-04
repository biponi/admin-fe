/**
 * Commission PDF Export Types
 * Defines types for client-side PDF generation
 */

import { OrderCommissionDetails } from "../api/commission";

/**
 * Export mode options
 */
export type ExportMode = "order-wise" | "user-wise" | "combined";

/**
 * PDF generation options
 */
export interface PdfGenerationOptions {
  mode: ExportMode;
  startDate?: string;
  endDate?: string;
  status?: string;
}

/**
 * User-wise breakdown data structure
 */
export interface UserWiseBreakdown {
  userId: string;
  userName: string;
  userAvatar: string; // URL or base64
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  pendingAmount: number;
  holdAmount: number;
  totalOrders: number;
  totalProducts: number;
  ordersAndProducts: OrderWithProducts[];
}

/**
 * Order with products grouped for user-wise view
 */
export interface OrderWithProducts {
  orderId: string;
  orderNumber: number;
  orderDate: string;
  products: ProductCommissionInfo[];
}

/**
 * Product commission information for PDF
 */
export interface ProductCommissionInfo {
  productId: string;
  productName: string;
  productImage: string; // URL or base64
  quantity: number;
  productPrice: number;
  totalPrice: number;
  commissionAmount: number;
  commissionType: "percentage" | "fixed";
  commissionRate: number;
  commissionStatus: string;
  commissionId: string;
  paidOffDate: string | null;
}

/**
 * Commission PDF document props
 */
export interface CommissionPdfProps {
  mode: ExportMode;
  orders?: OrderCommissionDetails[];
  userWiseData?: UserWiseBreakdown[];
  logoImage?: string; // base64
  reportDateRange?: string;
  reportGeneratedAt?: string;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: number, message?: string) => void;

/**
 * PDF generation result
 */
export interface PdfGenerationResult {
  success: boolean;
  filename?: string;
  error?: string;
}
