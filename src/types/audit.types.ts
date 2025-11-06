/**
 * Type definitions for Product Adjustment and Order Audit System
 */

// ===== Product Adjustment Types =====

export type AdjustmentType = "add" | "remove" | "set";

export interface ProductAdjustmentRequest {
  productId: string;
  variationId?: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: string;
  notes?: string;
  referenceNumber?: string;
}

export interface AdjustmentProduct {
  id: string;
  name: string;
  sku: string;
  oldQuantity: number;
  newQuantity: number;
  currentStock: number;
}

export interface AdjustmentInfo {
  id: string;
  productName: string;
  productSku: string;
  adjustmentType: AdjustmentType;
  quantityChange: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
  status: string;
}

export interface ProductAdjustmentResponse {
  success: true;
  adjustment: AdjustmentInfo;
  product: AdjustmentProduct;
}

export interface UserInfo {
  userId: string;
  userName: string;
  userEmail: string;
  userType: string;
}

export interface AdjustmentHistoryItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variationId?: string | null;
  variationDetails?: any;
  adjustmentType: AdjustmentType;
  oldQuantity: number;
  newQuantity: number;
  quantityChange: number;
  reason: string;
  notes?: string;
  referenceNumber?: string;
  adjustedBy: UserInfo;
  status: string;
  timestamps: {
    createdAt: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdjustmentHistoryResponse {
  adjustments: AdjustmentHistoryItem[];
  pagination: PaginationInfo & {
    totalAdjustments: number;
  };
}

export interface AdjustmentStatsResponse {
  totalAdjustments: number;
  totalAdded: number;
  totalRemoved: number;
  uniqueProductsCount: number;
  uniqueUsersCount: number;
}

// ===== Order Audit Types =====

export type AuditOperation =
  | "create"
  | "status_update"
  | "payment_update"
  | "product_update"
  | "bulk_action"
  | "customer_update"
  | "shipping_update"
  | "courier_update"
  | "cancel"
  | "delete"
  | "restore"
  | "fraud_review"
  | "notes_update";

export interface ChangeRecord {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AuditLogEntry {
  id: string;
  orderId: string;
  orderNumber: number;
  operation: AuditOperation;
  operationDescription: string;
  changesummary?: ChangeRecord[];
  performedBy: UserInfo;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamps: {
    createdAt: string;
  };
  isBulkOperation?: boolean;
}

export interface OrderAuditResponse {
  success: true;
  orderId: string;
  totalLogs: number;
  auditLogs: AuditLogEntry[];
}

export interface AllAuditsResponse {
  auditLogs: AuditLogEntry[];
  pagination: PaginationInfo & {
    totalAudits: number;
  };
}

export interface UserAuditsResponse {
  success: true;
  userId: string;
  totalLogs: number;
  auditLogs: AuditLogEntry[];
}

export interface AuditStatsResponse {
  success: true;
  stats: {
    totalAudits: number;
    uniqueOrdersCount: number;
    uniqueUsersCount: number;
    operationBreakdown: AuditOperation[];
  };
}

// ===== Query Parameter Types =====

export interface AdjustmentQueryParams {
  limit?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface AuditQueryParams {
  limit?: number;
  page?: number;
  operation?: AuditOperation;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
}

export interface StatsQueryParams {
  startDate?: string;
  endDate?: string;
}
