import { useState, useEffect, useCallback } from "react";
import {
  courierAPI,
  CourierOrdersListResponse,
  CourierOrder,
} from "../../../services/courierApi";
import { toast } from "react-hot-toast";
import { PaginationInfo } from "../types";

export const useCourierOrders = () => {
  const [orders, setOrders] = useState<CourierOrder[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(20);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [provider, setProvider] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  /**
   * Fetch courier orders list
   */
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: pageLimit,
      };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      if (provider) params.provider = provider;

      const response: CourierOrdersListResponse = await courierAPI.getOrders(
        params
      );

      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      } else {
        throw new Error("Failed to fetch courier orders");
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err.message ||
        "Failed to fetch courier orders";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageLimit, statusFilter, searchQuery, provider]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, pagination.totalPages]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Change page limit
   */
  const changeLimit = useCallback((limit: number) => {
    setPageLimit(limit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  /**
   * Set status filter
   */
  const filterByStatus = useCallback((status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  /**
   * Set provider filter
   */
  const filterByProvider = useCallback((provider: string) => {
    setProvider(provider);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  /**
   * Set search query
   */
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setStatusFilter("");
    setSearchQuery("");
    setCurrentPage(1);
    setProvider("");
  }, []);

  /**
   * Refresh orders list
   */
  const refresh = useCallback(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch orders when filters or pagination changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    // Data
    orders,
    pagination,
    isLoading,
    error,

    // Filters & Pagination
    currentPage,
    pageLimit,
    provider,
    statusFilter,
    searchQuery,

    // Actions
    fetchOrders,
    refresh,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    filterByStatus,
    filterByProvider,
    search,
    clearFilters,
  };
};

export default useCourierOrders;
