/**
 * Store Reserve History Type Definitions
 * Based on Product History API Documentation
 */

/**
 * Individual store reserve history item
 */
export interface StoreReserveHistoryItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  variantId: string;
  storeId: number;
  storeName: string;
  storeLocation: string;
  storeSlug: string;
  recordId: string;
  createdAt: string;
  createdBy: string;
}

/**
 * Pagination metadata
 */
export interface StoreHistoryPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Summary statistics for store history
 */
export interface StoreHistorySummary {
  totalRecords: number;
  totalQuantityReserved: number;
  uniqueStores: number;
}

/**
 * Complete store reserve history response
 */
export interface StoreReserveHistoryResponse {
  productId: string;
  history: StoreReserveHistoryItem[];
  pagination: StoreHistoryPagination;
  summary: StoreHistorySummary;
}

/**
 * Store-specific history response
 */
export interface StoreHistoryByStoreResponse {
  productId: string;
  storeId: number;
  history: StoreReserveHistoryItem[];
  pagination: StoreHistoryPagination;
  summary: {
    totalRecords: number;
    totalQuantityReserved: number;
  };
}

/**
 * Record-specific history response
 */
export interface StoreHistoryByRecordResponse {
  productId: string;
  recordId: string;
  record: StoreReserveHistoryItem & {
    totalProductsInRecord: number;
  };
}

/**
 * Query parameters for store history API
 */
export interface StoreHistoryQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'quantity' | 'unitPrice' | 'storeName' | 'createdBy';
  sortOrder?: 'asc' | 'desc';
}

/**
 * API response wrapper
 */
export interface StoreHistoryApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
