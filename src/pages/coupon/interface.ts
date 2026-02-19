// Re-export all interfaces from the API for convenience in components
export type {
  // Global Coupon Interfaces
  GlobalCoupon,
  CreateGlobalCouponRequest,
  UpdateGlobalCouponRequest,
  GetGlobalCouponsQuery,
  GlobalCouponStats,

  // Customer Coupon Interfaces
  CustomerCoupon,
  AssignCouponToCustomerRequest,
  BulkAssignCouponsRequest,
  UpdateCustomerCouponRequest,

  // Analytics Interfaces
  SegmentSummary,
  UsageHistoryEntry,
} from "../../api/coupon";

// Additional Component-specific Interfaces

export interface FormData {
  code: string;
  name: string;
  description: string;
  discountType: "fixed" | "percentage";
  discountValue: string;
  maxUsesPerCustomer: string;
  totalUsageLimit: string;
  validFrom: string;
  validUntil: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  firstOrderOnly: boolean;
  autoApply: boolean;
  priority: string;
  applicableProducts: string[];
  applicableCategories: string[];
}

export interface FormErrors {
  code?: string;
  name?: string;
  description?: string;
  discountType?: string;
  discountValue?: string;
  maxUsesPerCustomer?: string;
  totalUsageLimit?: string;
  validFrom?: string;
  validUntil?: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  priority?: string;
}

export interface FilterOptions {
  status: "all" | "active" | "expired" | "disabled" | "scheduled";
  discountType: "all" | "fixed" | "percentage";
}

export interface SegmentOption {
  value: string;
  label: string;
  description: string;
  criteria?: {
    days?: number;
    minSpent?: number;
    minOrders?: number;
  };
}

export interface AssignmentResult {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    phoneNumber: string;
    success: boolean;
    couponId?: string;
    code?: string;
    error?: string;
  }>;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: string;
}

export interface CouponAnalytics {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  disabledCoupons: number;
  totalUsage: number;
  totalDiscountGiven: number;
  mostUsedCoupons: Array<{
    code: string;
    usageCount: number;
    totalDiscount: number;
  }>;
}

export interface CustomerSegmentCard {
  type: string;
  title: string;
  count: number;
  icon: string;
  color: string;
  customers: Array<{
    phoneNumber: string;
    orderCount?: number;
    totalSpent?: number;
    lastOrderDate?: Date;
    firstOrderDate?: Date;
  }>;
}
