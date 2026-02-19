// Customer Analytics TypeScript Interfaces

export interface CustomerAddress {
  shippingAddress: string;
  shippingDistrict: string;
  shippingDivision: string;
  fullAddress: string;
}

export interface Customer {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingDistrict: string;
  shippingDivision: string;
  totalOrderCount: number;
  totalOrderAmount: number;
  totalSpent: number;
  lastOrderDate?: string;
  firstOrderDate?: string;
  averageOrderValue: number;
}

export interface CustomerOrder {
  orderNumber: number;
  orderDate: string;
  totalPrice: number;
  discount: number;
  paid: number;
  remaining: number;
  status: string;
}

export interface CustomerDetails {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress?: string;
  shippingDistrict?: string;
  shippingDivision?: string;
  fullAddress?: string;
  totalOrderCount: number;
  totalOrderAmount: number;
  totalDiscount: number;
  totalPaid: number;
  totalRemaining: number;
  totalDeliveryCharge: number;
  firstOrderDate?: string;
  lastOrderDate?: string;
  totalSpent: number;
  averageOrderValue: number;
  orders: CustomerOrder[];
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerAnalyticsResponse {
  success: boolean;
  data: {
    customers: Customer[];
    pagination: PaginationInfo;
  };
  message?: string;
}

export interface CustomerDetailsResponse {
  success: boolean;
  data: CustomerDetails;
  message?: string;
}

export interface CustomerStatsSummary {
  totalCustomers: number;
  totalRevenue: number;
  totalPaid: number;
  totalPending: number;
  totalOrders: number;
  avgSpentPerCustomer: number;
  avgOrdersPerCustomer: number;
}

export interface CustomerStatsTopCustomer {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalSpent: number;
  orderCount: number;
}

export interface CustomerStats {
  summary: CustomerStatsSummary;
  topCustomers: CustomerStatsTopCustomer[];
}

export interface CustomerStatsResponse {
  success: boolean;
  data: CustomerStats;
  message?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "blocked";
  sortBy?:
    | "name"
    | "totalOrders"
    | "totalSpent"
    | "lastOrderDate"
    | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface DateRange {
  from: string;
  to: string;
}
