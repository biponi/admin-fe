import { useState, useEffect, useCallback } from "react";
import fetchInventoryReport, {
  InventoryReportParams,
  BaseReportResponse,
} from "../api/inventoryReport";

/**
 * Inventory Report Hook with Caching
 * Provides state management and caching for inventory reports
 */

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<
  string,
  { data: BaseReportResponse<any>; timestamp: number }
>();

/**
 * Get cached data if available and not expired
 */
const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

/**
 * Set data in cache
 */
const setCachedData = (key: string, data: BaseReportResponse<any>) => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Generate cache key from parameters
 */
const generateCacheKey = (params: InventoryReportParams): string => {
  return JSON.stringify(params);
};

/**
 * Invalidate cache for a specific pattern
 */
export const invalidateInventoryReportCache = (pattern: string) => {
  Array.from(cache.keys()).forEach((key) => {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  });
};

/**
 * Clear all inventory report cache
 */
export const clearInventoryReportCache = () => {
  cache.clear();
};

/**
 * Custom hook for fetching inventory reports
 * @param params - Report parameters
 * @param options - Hook options
 * @returns Report data, loading state, error, and refetch function
 */
export const useInventoryReport = (
  params: InventoryReportParams,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) => {
  const { enabled = true, refetchInterval } = options || {};

  const [data, setData] = useState<BaseReportResponse<any> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch report data
   */
  const fetchReport = useCallback(async (useCache = true) => {
    if (!enabled) return;

    const cacheKey = generateCacheKey(params);

    // Check cache first
    if (useCache) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchInventoryReport(params);

      if (response.success && response.data) {
        setData(response);
        // Cache successful response
        setCachedData(cacheKey, response);
      } else {
        setError(response.error || "Failed to fetch report");
        setData(null);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [params, enabled]);

  /**
   * Refetch without cache
   */
  const refetch = useCallback(() => {
    return fetchReport(false);
  }, [fetchReport]);

  /**
   * Initial fetch and interval refetch
   */
  useEffect(() => {
    fetchReport(true);

    if (refetchInterval) {
      const interval = setInterval(() => {
        fetchReport(false);
      }, refetchInterval);

      return () => clearInterval(interval);
    }
  }, [fetchReport, refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Hook for paginated reports with page state management
 */
export const usePaginatedInventoryReport = (
  baseParams: Omit<InventoryReportParams, "page" | "limit">,
  initialPage: number = 1,
  initialLimit: number = 20
) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const params: InventoryReportParams = {
    ...baseParams,
    page,
    limit,
  };

  const { data, loading, error, refetch } = useInventoryReport(params);

  const pagination = data?.data?.pagination;

  /**
   * Go to specific page
   */
  const goToPage = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  /**
   * Go to next page
   */
  const nextPage = () => {
    if (pagination?.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  /**
   * Go to previous page
   */
  const prevPage = () => {
    if (pagination?.hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  };

  /**
   * Change page size
   */
  const changePageSize = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page
  };

  return {
    data,
    loading,
    error,
    refetch,
    pagination,
    currentPage: page,
    pageSize: limit,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
  };
};

export default useInventoryReport;
