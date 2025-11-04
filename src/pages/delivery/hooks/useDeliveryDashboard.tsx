import { useState, useEffect, useCallback } from "react";
import { courierAPI, DashboardStats } from "../../../services/courierApi";
import { toast } from "react-hot-toast";

export const useDeliveryDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardStats["data"] | null>(
    null
  );
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  /**
   * Fetch dashboard statistics
   */
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (selectedStatus) params.status = selectedStatus;

      const response: DashboardStats = await courierAPI.getDashboard(params);

      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err.message || "Failed to fetch dashboard data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedStatus]);

  /**
   * Fetch account balance
   */
  const fetchBalance = useCallback(async () => {
    try {
      const response = await courierAPI.getBalance();
      if (response.success) {
        setBalance(response.data.balance);
      }
    } catch (err: any) {
      console.error("Failed to fetch balance:", err);
      // Don't show error toast for balance fetch failure
    }
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await Promise.all([fetchDashboard(), fetchBalance()]);
  }, [fetchDashboard, fetchBalance]);

  /**
   * Set date range filter
   */
  const setDateRange = useCallback(
    (start: string, end: string) => {
      setStartDate(start);
      setEndDate(end);
    },
    []
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setStartDate("");
    setEndDate("");
    setSelectedStatus("");
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refetch when filters change
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    // Data
    dashboardData,
    balance,
    isLoading,
    error,

    // Filters
    startDate,
    endDate,
    selectedStatus,
    setStartDate,
    setEndDate,
    setSelectedStatus,
    setDateRange,
    clearFilters,

    // Actions
    refresh,
    fetchDashboard,
    fetchBalance,
  };
};

export default useDeliveryDashboard;
