import axios from "./axios";
import type { AxiosProgressEvent } from "axios";
import config from "../utils/config";
import { handleApiError } from ".";

/**
 * Product Inventory Report API Service
 * Handles all inventory report generation requests
 * API Endpoint: /api/v1/product/inventory-report
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

export interface BaseReportResponse<T> {
  success: boolean;
  data?: {
    reportType: string;
    generatedAt: string;
    filters: Record<string, any>;
    summary: Record<string, any>;
    data: T[];
    pagination?: PaginationMetadata;
  };
  error?: string;
}

// Report Types
export type ReportType =
  | "inventory-summary"
  | "low-stock"
  | "out-of-stock"
  | "inventory-distribution"
  | "top-selling"
  | "sales-activity"
  | "return-rate"
  | "dead-stock"
  | "top-rated"
  | "rating-distribution"
  | "discounted-products"
  | "highest-discount"
  | "price-distribution"
  | "category-performance"
  | "manufacturer-report"
  | "recently-added"
  | "recently-updated";

// Request Parameters
export interface InventoryReportParams {
  type: ReportType;
  categoryId?: string;
  includeSubcategories?: boolean;
  active?: string | boolean;
  manufacturerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  threshold?: number;
  days?: number;
  onProgress?: (progress: number) => void;
}

// Report-specific Data Types
export interface InventorySummary {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalInventoryUnits: number;
  totalInventoryValue: number;
}

export interface LowStockProduct {
  name: string;
  sku: string;
  categoryId: string;
  totalStock: number;
  inventoryValue: number;
  unitPrice: number;
  active: boolean;
  hasVariation: boolean;
}

export interface OutOfStockProduct {
  name: string;
  sku: string;
  categoryId: string;
  totalStock: number;
  unitPrice: number;
  active: boolean;
  hasVariation: boolean;
}

export interface InventoryDistribution {
  range: string;
  count: number;
  productCount: number;
}

export interface TopSellingProduct {
  name: string;
  sku: string;
  categoryId: string;
  totalSold: number;
  totalStock: number;
  active: boolean;
}

export interface SalesActivityProduct {
  name: string;
  lastPurchasedAt: string;
  totalSold: number;
  sku: string;
  active: boolean;
}

export interface ReturnRateProduct {
  name: string;
  sku: string;
  totalSold: number;
  totalReturned: number;
  returnRate: number;
  active: boolean;
}

export interface DeadStockProduct {
  name: string;
  sku: string;
  totalStock: number;
  lastPurchasedAt: string;
  daysSinceLastSale: number;
  active: boolean;
}

export interface TopRatedProduct {
  name: string;
  sku: string;
  rating: number;
  totalReviews: number;
  active: boolean;
}

export interface RatingDistribution {
  rating: string;
  totalVotes: number;
}

export interface DiscountedProduct {
  name: string;
  originalPrice: number;
  discount: number;
  discountType: string;
  finalPrice: number;
}

export interface HighestDiscountProduct {
  name: string;
  unitPrice: number;
  discount: number;
  discountType: string;
  active: boolean;
}

export interface PriceDistribution {
  priceRange: string;
  numberOfProducts: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  productCount: number;
  unitsSold: number;
  stockUnits: number;
}

export interface ManufacturerReport {
  manufacturer: string;
  productCount: number;
  unitsSold: number;
}

export interface RecentlyAddedProduct {
  name: string;
  createdDate: string;
}

export interface RecentlyUpdatedProduct {
  name: string;
  lastUpdatedDate: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Fetch inventory report from API
 * @param params - Report parameters
 * @returns Response with report data
 */
export const fetchInventoryReport = async (
  params: InventoryReportParams
): Promise<BaseReportResponse<any>> => {
  try {
    const {
      type,
      categoryId,
      includeSubcategories = false,
      active = "all",
      manufacturerId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy,
      sortOrder = "desc",
      threshold,
      days,
      onProgress,
    } = params;

    // Build query parameters
    const queryParams: Record<string, string> = {
      type,
      page: page.toString(),
      limit: limit.toString(),
    };

    if (categoryId) queryParams.categoryId = categoryId;
    if (includeSubcategories)
      queryParams.includeSubcategories = includeSubcategories.toString();
    if (active !== "all") queryParams.active = String(active);
    if (manufacturerId) queryParams.manufacturerId = manufacturerId;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;
    if (sortBy) queryParams.sortBy = sortBy;
    if (sortOrder) queryParams.sortOrder = sortOrder;
    if (threshold !== undefined) queryParams.threshold = threshold.toString();
    if (days !== undefined) queryParams.days = days.toString();

    const queryString = new URLSearchParams(queryParams).toString();

    // Make request - using inventory-report endpoint
    const response = await axios.get<any>(
      `/api/v1/product/inventory-report?${queryString}`,
      {
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );

    if (response.status === 200 && response.data?.success) {
      return {
        success: true,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        error: response.data?.error || "Failed to fetch report",
      };
    }
  } catch (error: any) {
    console.error("Error fetching inventory report:", error);
    return handleApiError(error);
  }
};

export default fetchInventoryReport;
