import axios from "./axios";
import config from "../utils/config";
import { handleApiError } from ".";

// Base API Response Interface
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// GLOBAL COUPON INTERFACES
// ============================================

export interface GlobalCoupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  maxUsesPerCustomer: number;
  totalUsageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  status: "active" | "expired" | "disabled" | "scheduled";
  minOrderAmount: number;
  maxDiscountAmount: number;
  firstOrderOnly: boolean;
  autoApply: boolean;
  priority: number;
  applicableProducts: string[];
  applicableCategories: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGlobalCouponRequest {
  code: string;
  name: string;
  description?: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  maxUsesPerCustomer: number;
  totalUsageLimit?: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  firstOrderOnly?: boolean;
  autoApply?: boolean;
  priority?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export interface UpdateGlobalCouponRequest {
  name?: string;
  description?: string;
  discountType?: "fixed" | "percentage";
  discountValue?: number;
  maxUsesPerCustomer?: number;
  totalUsageLimit?: number;
  validFrom?: string;
  validUntil?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  firstOrderOnly?: boolean;
  autoApply?: boolean;
  priority?: number;
  status?: "active" | "disabled";
  applicableProducts?: string[];
  applicableCategories?: string[];
}

export interface GetGlobalCouponsQuery {
  status?: "active" | "expired" | "disabled" | "scheduled";
  discountType?: "fixed" | "percentage";
}

export interface GlobalCouponStats {
  totalCoupons: number;
  activeCoupons: number;
  expiredCoupons: number;
  disabledCoupons: number;
  mostUsed: Array<{
    code: string;
    usageCount: number;
    totalDiscount: number;
  }>;
}

// ============================================
// CUSTOMER COUPON INTERFACES
// ============================================

export interface CustomerCoupon {
  _id: string;
  customerId: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  remainingUses: number;
  validFrom: Date;
  validUntil: Date;
  status: "active" | "expired" | "disabled" | "fully_used";
  minOrderAmount: number;
  maxDiscountAmount: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  assignedBy: string;
  assignedAt: Date;
  metadata?: {
    source?: string;
    notes?: string;
    campaignId?: string;
  };
}

export interface AssignCouponToCustomerRequest {
  phoneNumbers: string[];
  discountType: "fixed" | "percentage";
  discountValue: number;
  maxUses: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  code?: string;
  metadata?: {
    source?: "single" | "bulk" | "campaign" | "automation";
    notes?: string;
    campaignId?: string;
  };
}

export interface BulkAssignCouponsRequest {
  phoneNumbers?: string[];
  segment?: "inactive" | "highValue" | "new" | "frequent" | "firstTime" | "churned" | "byProduct" | "byOrderValue";
  segmentCriteria?: {
    days?: number;
    minSpent?: number;
    minOrders?: number;
    productId?: string;
    minOrderValue?: number;
    maxOrderValue?: number;
  };
  couponData: {
    discountType: "fixed" | "percentage";
    discountValue: number;
    maxUses: number;
    validFrom: string;
    validUntil: string;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
  };
  adminId?: string;
}

export interface UpdateCustomerCouponRequest {
  maxUses?: number;
  validFrom?: string;
  validUntil?: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  status?: "active" | "disabled";
  applicableProducts?: string[];
  applicableCategories?: string[];
}

// ============================================
// ANALYTICS INTERFACES
// ============================================

export interface SegmentSummary {
  newCustomers: {
    count: number;
    customers: Array<{
      phoneNumber: string;
      firstOrderDate: Date;
      orderCount: number;
      totalSpent: number;
    }>;
  };
  inactiveCustomers: {
    count: number;
    customers: Array<{
      phoneNumber: string;
      lastOrderDate: Date;
      orderCount: number;
      totalSpent: number;
    }>;
  };
  highValueCustomers: {
    count: number;
    customers: Array<{
      phoneNumber: string;
      totalSpent: number;
      orderCount: number;
      lastOrderDate: Date;
      avgOrderValue: number;
    }>;
  };
  frequentCustomers: {
    count: number;
    customers: Array<{
      phoneNumber: string;
      orderCount: number;
      totalSpent: number;
      lastOrderDate: Date;
      firstOrderDate: Date;
    }>;
  };
  firstTimeCustomers: {
    count: number;
    customers: Array<{
      phoneNumber: string;
      orderCount: number;
      totalSpent: number;
      orderDate: Date;
    }>;
  };
}

export interface UsageHistoryEntry {
  _id: string;
  couponType: "global" | "customer";
  couponId: string;
  couponCode: string;
  customerId: string;
  orderId: string;
  orderNumber: number;
  discountAmount: number;
  orderTotal: number;
  usedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================
// GLOBAL COUPON API FUNCTIONS
// ============================================

/**
 * Create a new global coupon
 */
export const createGlobalCoupon = async (
  couponData: CreateGlobalCouponRequest
): Promise<ApiResponse<GlobalCoupon>> => {
  try {
    const response = await axios.post<{
      success: boolean;
      data?: GlobalCoupon;
      error?: string;
    }>(config.coupon.createGlobal(), couponData);

    if (response.status === 201) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to create global coupon",
      };
    }
  } catch (error: any) {
    console.error("Error creating global coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get all global coupons with optional filters
 */
export const getAllGlobalCoupons = async (
  params?: GetGlobalCouponsQuery
): Promise<ApiResponse<{ count: number; data: GlobalCoupon[] }>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      count: number;
      data?: GlobalCoupon[];
      error?: string;
    }>(config.coupon.getAllGlobal(), { params });

    if (response.status === 200) {
      return { success: true, data: { count: response.data.count, data: response.data.data || [] } };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get global coupons",
      };
    }
  } catch (error: any) {
    console.error("Error getting global coupons:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get a global coupon by code
 */
export const getGlobalCouponByCode = async (
  code: string
): Promise<ApiResponse<GlobalCoupon>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      data?: GlobalCoupon;
      error?: string;
    }>(config.coupon.getGlobalByCode(code));

    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get global coupon",
      };
    }
  } catch (error: any) {
    console.error("Error getting global coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Update a global coupon
 */
export const updateGlobalCoupon = async (
  code: string,
  couponData: UpdateGlobalCouponRequest
): Promise<ApiResponse<GlobalCoupon>> => {
  try {
    const response = await axios.patch<{
      success: boolean;
      data?: GlobalCoupon;
      message?: string;
      error?: string;
    }>(config.coupon.updateGlobal(code), couponData);

    if (response.status === 200) {
      return { success: true, data: response.data.data, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update global coupon",
      };
    }
  } catch (error: any) {
    console.error("Error updating global coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Disable a global coupon
 */
export const disableGlobalCoupon = async (
  code: string
): Promise<ApiResponse<{ _id: string; code: string; status: string }>> => {
  try {
    const response = await axios.post<{
      success: boolean;
      data?: { _id: string; code: string; status: string };
      message?: string;
      error?: string;
    }>(config.coupon.disableGlobal(code));

    if (response.status === 200) {
      return { success: true, data: response.data.data, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to disable global coupon",
      };
    }
  } catch (error: any) {
    console.error("Error disabling global coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Delete a global coupon
 */
export const deleteGlobalCoupon = async (
  code: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete<{
      success: boolean;
      message?: string;
      error?: string;
    }>(config.coupon.deleteGlobal(code));

    if (response.status === 200) {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete global coupon",
      };
    }
  } catch (error: any) {
    console.error("Error deleting global coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get global coupon statistics
 */
export const getGlobalCouponStats = async (): Promise<ApiResponse<GlobalCouponStats>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      data?: GlobalCouponStats;
      error?: string;
    }>(config.coupon.getGlobalStats());

    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get global coupon stats",
      };
    }
  } catch (error: any) {
    console.error("Error getting global coupon stats:", error.message);
    return handleApiError(error);
  }
};

// ============================================
// CUSTOMER COUPON API FUNCTIONS
// ============================================

/**
 * Assign coupon to customer(s)
 */
export const assignCouponToCustomer = async (
  assignmentData: AssignCouponToCustomerRequest
): Promise<
  ApiResponse<
    Array<{
      phoneNumber: string;
      success: boolean;
      couponId?: string;
      code?: string;
      error?: string;
    }>
  >
> => {
  try {
    const response = await axios.post<{
      success: boolean;
      message?: string;
      data?: Array<{
        phoneNumber: string;
        success: boolean;
        couponId?: string;
        code?: string;
        error?: string;
      }>;
      error?: string;
    }>(config.coupon.assignToCustomer(), assignmentData);

    if (response.status === 201) {
      return { success: true, data: response.data.data, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to assign coupon to customer",
      };
    }
  } catch (error: any) {
    console.error("Error assigning coupon to customer:", error.message);
    return handleApiError(error);
  }
};

/**
 * Bulk assign coupons by segment
 */
export const bulkAssignCoupons = async (
  bulkData: BulkAssignCouponsRequest
): Promise<
  ApiResponse<{
    success: Array<{ phoneNumber: string; couponId: string; code: string }>;
    failed: Array<{ phoneNumber: string; error: string }>;
    total: number;
  }>
> => {
  try {
    const response = await axios.post<{
      success: boolean;
      message?: string;
      data?: {
        success: Array<{ phoneNumber: string; couponId: string; code: string }>;
        failed: Array<{ phoneNumber: string; error: string }>;
        total: number;
      };
      error?: string;
    }>(config.coupon.bulkAssign(), bulkData);

    if (response.status === 201) {
      return { success: true, data: response.data.data, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to bulk assign coupons",
      };
    }
  } catch (error: any) {
    console.error("Error bulk assigning coupons:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get customer's coupons
 */
export const getCustomerCoupons = async (
  phone: string
): Promise<ApiResponse<{ count: number; data: CustomerCoupon[] }>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      count: number;
      data?: CustomerCoupon[];
      error?: string;
    }>(config.coupon.getCustomerCoupons(phone));

    if (response.status === 200) {
      return { success: true, data: { count: response.data.count, data: response.data.data || [] } };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get customer coupons",
      };
    }
  } catch (error: any) {
    console.error("Error getting customer coupons:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get customer coupon usage history
 */
export const getCustomerUsageHistory = async (
  phone: string
): Promise<ApiResponse<{ count: number; data: UsageHistoryEntry[] }>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      count: number;
      data?: UsageHistoryEntry[];
      error?: string;
    }>(config.coupon.getCustomerHistory(phone));

    if (response.status === 200) {
      return { success: true, data: { count: response.data.count, data: response.data.data || [] } };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get customer usage history",
      };
    }
  } catch (error: any) {
    console.error("Error getting customer usage history:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get customer coupon by ID
 */
export const getCustomerCouponById = async (
  id: string
): Promise<ApiResponse<CustomerCoupon>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      data?: CustomerCoupon;
      error?: string;
    }>(config.coupon.getCustomerCouponById(id));

    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get customer coupon",
      };
    }
  } catch (error: any) {
    console.error("Error getting customer coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Update customer coupon
 */
export const updateCustomerCoupon = async (
  id: string,
  couponData: UpdateCustomerCouponRequest
): Promise<ApiResponse<CustomerCoupon>> => {
  try {
    const response = await axios.patch<{
      success: boolean;
      data?: CustomerCoupon;
      message?: string;
      error?: string;
    }>(config.coupon.updateCustomerCoupon(id), couponData);

    if (response.status === 200) {
      return { success: true, data: response.data.data, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to update customer coupon",
      };
    }
  } catch (error: any) {
    console.error("Error updating customer coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Disable customer coupon
 */
export const disableCustomerCoupon = async (
  id: string
): Promise<ApiResponse<{ _id: string; code: string; status: string }>> => {
  try {
    const response = await axios.post<{
      success: boolean;
      data?: { _id: string; code: string; status: string };
      message?: string;
      error?: string;
    }>(config.coupon.disableCustomerCoupon(id));

    if (response.status === 200) {
      return { success: true, data: response.data.data, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to disable customer coupon",
      };
    }
  } catch (error: any) {
    console.error("Error disabling customer coupon:", error.message);
    return handleApiError(error);
  }
};

/**
 * Delete customer coupon
 */
export const deleteCustomerCoupon = async (
  id: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await axios.delete<{
      success: boolean;
      message?: string;
      error?: string;
    }>(config.coupon.deleteCustomerCoupon(id));

    if (response.status === 200) {
      return { success: true, message: response.data.message };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to delete customer coupon",
      };
    }
  } catch (error: any) {
    console.error("Error deleting customer coupon:", error.message);
    return handleApiError(error);
  }
};

// ============================================
// ANALYTICS API FUNCTIONS
// ============================================

/**
 * Get customer segment summary
 */
export const getSegmentSummary = async (): Promise<ApiResponse<SegmentSummary>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      data?: SegmentSummary;
      error?: string;
    }>(config.coupon.getSegmentSummary());

    if (response.status === 200) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get segment summary",
      };
    }
  } catch (error: any) {
    console.error("Error getting segment summary:", error.message);
    return handleApiError(error);
  }
};

/**
 * Get coupon usage history
 */
export const getCouponUsageHistory = async (
  couponType: "global" | "customer",
  couponId: string
): Promise<ApiResponse<{ count: number; data: UsageHistoryEntry[] }>> => {
  try {
    const response = await axios.get<{
      success: boolean;
      count: number;
      data?: UsageHistoryEntry[];
      error?: string;
    }>(config.coupon.getUsageHistory(), {
      params: { couponType, couponId },
    });

    if (response.status === 200) {
      return { success: true, data: { count: response.data.count, data: response.data.data || [] } };
    } else {
      return {
        success: false,
        error: response.data.error || "Failed to get usage history",
      };
    }
  } catch (error: any) {
    console.error("Error getting usage history:", error.message);
    return handleApiError(error);
  }
};
