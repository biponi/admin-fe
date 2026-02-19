// ============= Product Analytics Type Definitions =============
// These types are used across the product analytics components
// and match the API response structure from the backend

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface ProductOrderHistoryResponse {
  product: {
    id: string;
    name: string;
    sku: string;
    slug: string;
    thumbnail: string;
    unitPrice: number;
    currentStock: number;
  };
  summary: {
    totalOrders: number;
    totalQuantitySold: number;
    totalRevenue: number;
    averageOrderValue: number;
    averageQuantityPerOrder: number;
    uniqueCustomers: number;
    statusBreakdown: Record<string, number>;
  };
  orders: OrderData[];
  customers: CustomerData[];
  pagination: PaginationMetadata;
}

export interface OrderData {
  orderId: string;
  orderNumber: number;
  customer: {
    name: string;
    email: string;
    phoneNumber: string;
    address?: string;
  };
  productDetails: {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount: number;
    variantId?: string;
    variation?: {
      size?: string;
      color?: string;
    };
  };
  orderDate: string;
  status: string;
  orderTotal: number;
  deliveryStatus: string;
}

export interface CustomerData {
  customerPhone: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  totalOrders: number;
  totalQuantity: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

export interface ProductPurchaseHistoryResponse {
  product: {
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    lastPurchasedAt: string;
  };
  summary: {
    totalPurchaseOrders: number;
    totalQuantityPurchased: number;
    totalCost: number;
    averagePurchaseQuantity: number;
    averageCostPerUnit: number;
    lastPurchaseOrder: {
      purchaseNumber: number;
      date: string;
      quantity: number;
      unitPrice: number;
    };
  };
  purchaseOrders: PurchaseOrderData[];
  suppliers: any[];
  pagination: PaginationMetadata;
}

export interface PurchaseOrderData {
  purchaseOrderId: string;
  purchaseNumber: number;
  productDetails: {
    quantity: number;
    unitPrice: number;
    totalCost: number;
    variantId?: string;
    title: string;
    sku: string;
    variation?: {
      size?: string;
      color?: string;
    };
  };
  purchaseDate: string;
  totalAmount: number;
  createdAt: string;
}

export interface ProductAdjustmentHistoryResponse {
  product: {
    id: string;
    name: string;
    sku: string;
    currentQuantity: number;
  };
  summary: {
    totalAdjustments: number;
    totalAdded: number;
    totalRemoved: number;
    totalSet: number;
    netChange: number;
    pendingApprovals: number;
    approvedAdjustments: number;
    rejectedAdjustments: number;
    typeBreakdown: Record<string, number>;
    statusBreakdown: Record<string, number>;
  };
  adjustments: AdjustmentData[];
  adjustmentSummary: any[];
  pagination: PaginationMetadata;
}

export interface AdjustmentData {
  adjustmentId: string;
  adjustmentType: "add" | "remove" | "set";
  oldQuantity: number;
  newQuantity: number;
  quantityChange: number;
  variationId?: string;
  variationDetails?: {
    size?: string;
    color?: string;
    sku?: string;
  };
  reason: string;
  notes?: string;
  referenceNumber?: string;
  adjustedBy: {
    userId: string;
    userName: string;
    userEmail: string;
    userType: string;
  };
  status: string;
  approvedBy?: {
    userId: string;
    userName: string;
    approvedAt: string;
  };
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============= Query Parameters =============

export interface AnalyticsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  status?: string;
  adjustmentType?: "add" | "remove" | "set";
}
