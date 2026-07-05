import { useState, useEffect, useCallback } from "react";
import {
  getOrderModifications,
  OrderModificationItem,
  PaginationMeta,
} from "../api/adminAudit";

export const useOrderModifications = () => {
  const [modifications, setModifications] = useState<OrderModificationItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [summary, setSummary] = useState<{
    totalModifications: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchModifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };

      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      if (searchQuery) params.search = searchQuery;

      const result = await getOrderModifications(params);

      if (result.success && result.data) {
        setModifications(result.data.modifications);
        setPagination(result.data.pagination);
        setSummary(result.data.summary);
      } else {
        setError(result.error || "Failed to fetch data");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, sortBy, sortOrder, dateRange, searchQuery]);

  useEffect(() => {
    fetchModifications();
  }, [fetchModifications]);

  const goToPage = (page: number) => setCurrentPage(page);
  const nextPage = () => {
    if (pagination?.hasNextPage) setCurrentPage((p) => p + 1);
  };
  const prevPage = () => {
    if (pagination?.hasPreviousPage) setCurrentPage((p) => p - 1);
  };
  const resetFilters = () => {
    setCurrentPage(1);
    setSortBy("createdAt");
    setSortOrder("desc");
    setDateRange({});
    setSearchQuery("");
  };

  return {
    modifications,
    pagination,
    summary,
    isLoading,
    error,
    currentPage,
    limit,
    sortBy,
    sortOrder,
    dateRange,
    searchQuery,
    setCurrentPage: goToPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setDateRange,
    setSearchQuery,
    nextPage,
    prevPage,
    resetFilters,
    refetch: fetchModifications,
  };
};
