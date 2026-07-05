import { useState, useEffect, useCallback } from "react";
import {
  getStockAdjustments,
  StockAdjustmentItem,
  PaginationMeta,
} from "../api/adminAudit";

export const useStockAdjustments = () => {
  const [adjustments, setAdjustments] = useState<StockAdjustmentItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [summary, setSummary] = useState<{
    totalIncreases: number;
    totalDecreases: number;
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
  const [direction, setDirection] = useState<"increase" | "decrease" | "">("");
  const [adjustmentType, setAdjustmentType] = useState<
    "add" | "remove" | "set" | ""
  >("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAdjustments = useCallback(async () => {
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
      if (direction) params.direction = direction;
      if (adjustmentType) params.adjustmentType = adjustmentType;
      if (searchQuery) params.search = searchQuery;

      const result = await getStockAdjustments(params);

      if (result.success && result.data) {
        setAdjustments(result.data.adjustments);
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
  }, [currentPage, limit, sortBy, sortOrder, dateRange, direction, adjustmentType, searchQuery]);

  useEffect(() => {
    fetchAdjustments();
  }, [fetchAdjustments]);

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
    setDirection("");
    setAdjustmentType("");
    setSearchQuery("");
  };

  return {
    adjustments,
    pagination,
    summary,
    isLoading,
    error,
    currentPage,
    limit,
    sortBy,
    sortOrder,
    dateRange,
    direction,
    adjustmentType,
    searchQuery,
    setCurrentPage: goToPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setDateRange,
    setDirection,
    setAdjustmentType,
    setSearchQuery,
    nextPage,
    prevPage,
    resetFilters,
    refetch: fetchAdjustments,
  };
};
