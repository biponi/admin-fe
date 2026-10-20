import { useState, useEffect, useCallback } from "react";
import {
  getActivityFeed,
  getActivityStats,
  getUserTimeline,
  ActivityLogEntry,
  ActivityPagination,
  ActivityStatsResponse,
  UserTimelineResponse,
} from "../api/activityLog";

export interface ActivityFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
  method?: string;
  success?: string;
  ip?: string;
  search?: string;
}

const EMPTY_FILTERS: ActivityFilters = {};

export const useActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [pagination, setPagination] = useState<ActivityPagination | null>(null);
  const [stats, setStats] = useState<ActivityStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_FILTERS);

  const fetchFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit,
        sortBy: "desc",
      };
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });

      const result = await getActivityFeed(params);

      if (result.success && result.data) {
        setLogs(result.data.logs);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || "Failed to fetch activity feed");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, filters]);

  const fetchStats = useCallback(async () => {
    setIsStatsLoading(true);
    try {
      const params: Record<string, any> = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params[key] = value;
        }
      });
      const result = await getActivityStats(params);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch {
      // stats are non-critical; surface via feed error state instead
    } finally {
      setIsStatsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const updateFilter = (key: keyof ActivityFilters, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const setDateRange = (startDate?: string, endDate?: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, startDate, endDate }));
  };

  const resetFilters = () => {
    setCurrentPage(1);
    setFilters(EMPTY_FILTERS);
  };

  const nextPage = () => {
    if (pagination?.hasNext) setCurrentPage((p) => p + 1);
  };
  const prevPage = () => {
    if (pagination?.hasPrev) setCurrentPage((p) => Math.max(1, p - 1));
  };

  return {
    logs,
    pagination,
    stats,
    isLoading,
    isStatsLoading,
    error,
    currentPage,
    limit,
    filters,
    setCurrentPage: (page: number) => setCurrentPage(page),
    setLimit,
    updateFilter,
    setDateRange,
    resetFilters,
    nextPage,
    prevPage,
    refetch: fetchFeed,
    refetchStats: fetchStats,
  };
};

export const useUserTimeline = () => {
  const [timeline, setTimeline] = useState<UserTimelineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(
    async (userId: string, page = 1, limit = 50) => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);
      try {
        const result = await getUserTimeline(userId, { page, limit });
        if (result.success && result.data) {
          setTimeline(result.data);
        } else {
          setError(result.error || "Failed to fetch user timeline");
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearTimeline = () => setTimeline(null);

  return { timeline, isLoading, error, fetchTimeline, clearTimeline };
};
