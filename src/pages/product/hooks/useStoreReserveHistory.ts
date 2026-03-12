import { useState, useCallback } from "react";
import { useToast } from "../../../components/ui/use-toast";
import {
  getProductHistory,
  getProductHistoryByStore,
  getProductHistoryByRecord,
} from "../../../api/productHistory";
import {
  StoreReserveHistoryResponse,
  StoreHistoryByStoreResponse,
  StoreHistoryByRecordResponse,
  StoreHistoryQueryParams,
} from "../interface.store-history";

export const useStoreReserveHistory = (productId: string) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Main history state
  const [historyData, setHistoryData] =
    useState<StoreReserveHistoryResponse | null>(null);
  const [historyParams, setHistoryParams] = useState<StoreHistoryQueryParams>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Store-specific history state
  const [storeHistoryData, setStoreHistoryData] =
    useState<StoreHistoryByStoreResponse | null>(null);
  const [storeHistoryParams, setStoreHistoryParams] =
    useState<StoreHistoryQueryParams>({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  // Record details state
  const [recordData, setRecordData] =
    useState<StoreHistoryByRecordResponse | null>(null);
  const [recordLoading, setRecordLoading] = useState(false);

  /**
   * Fetch complete product history across all stores
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchHistory = useCallback(
    async (params?: StoreHistoryQueryParams) => {
      setLoading(true);
      setError(null);
      try {
        const mergedParams = { ...historyParams, ...params };
        const response = await getProductHistory(productId, mergedParams);
        if (response?.success && response?.data) {
          setHistoryData(response.data);
          // Only update params if new params were provided
          if (params) {
            setHistoryParams(mergedParams);
          }
        } else {
          setError(response?.error || "Failed to fetch store reserve history");
          toast({
            variant: "destructive",
            title: "Error",
            description:
              response?.error || "Failed to fetch store reserve history",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [productId, toast],
  ); // historyParams intentionally omitted to prevent infinite loop

  /**
   * Fetch history for a specific store
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchStoreHistory = useCallback(
    async (storeId: number, params?: StoreHistoryQueryParams) => {
      setLoading(true);
      setError(null);
      try {
        const mergedParams = { ...storeHistoryParams, ...params };
        const response = await getProductHistoryByStore(
          productId,
          storeId,
          mergedParams,
        );
        if (response?.success && response?.data) {
          setStoreHistoryData(response.data);
          if (params) {
            setStoreHistoryParams(mergedParams);
          }
        } else {
          setError(response?.error || "Failed to fetch store history");
          toast({
            variant: "destructive",
            title: "Error",
            description: response?.error || "Failed to fetch store history",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [productId, toast],
  ); // storeHistoryParams intentionally omitted to prevent infinite loop

  /**
   * Fetch details for a specific record
   */
  const fetchRecordDetails = useCallback(
    async (recordId: string) => {
      setRecordLoading(true);
      setError(null);
      try {
        const response = await getProductHistoryByRecord(productId, recordId);
        if (response?.success && response?.data) {
          setRecordData(response.data);
        } else {
          setError(response?.error || "Failed to fetch record details");
          toast({
            variant: "destructive",
            title: "Error",
            description: response?.error || "Failed to fetch record details",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      } finally {
        setRecordLoading(false);
      }
    },
    [productId, toast],
  ); // Dependencies for fetchRecordDetails

  /**
   * Update history parameters and refetch
   */
  const updateHistoryParams = useCallback(
    (params: StoreHistoryQueryParams) => {
      // Reset to page 1 on filter change
      const mergedParams = { ...params, page: 1 };
      setHistoryParams((prev) => ({ ...prev, ...mergedParams }));
      fetchHistory(mergedParams);
    },
    [fetchHistory],
  );

  /**
   * Update store history parameters and refetch
   */
  const updateStoreHistoryParams = useCallback(
    (storeId: number, params: StoreHistoryQueryParams) => {
      const mergedParams = { ...params, page: 1 };
      setStoreHistoryParams((prev) => ({ ...prev, ...mergedParams }));
      fetchStoreHistory(storeId, mergedParams);
    },
    [fetchStoreHistory],
  );

  /**
   * Change page
   */
  const changePage = useCallback(
    (page: number) => {
      fetchHistory({ page });
    },
    [fetchHistory],
  );

  /**
   * Change page size
   */
  const changePageSize = useCallback(
    (limit: number) => {
      fetchHistory({ limit, page: 1 });
    },
    [fetchHistory],
  );

  /**
   * Reset all filters to default
   */
  const resetFilters = useCallback(() => {
    const defaultParams: StoreHistoryQueryParams = {
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setHistoryParams(defaultParams);
    fetchHistory(defaultParams);
  }, [fetchHistory]);

  return {
    // State
    historyData,
    storeHistoryData,
    recordData,
    loading,
    recordLoading,
    error,
    historyParams,
    storeHistoryParams,

    // Methods
    fetchHistory,
    fetchStoreHistory,
    fetchRecordDetails,
    updateHistoryParams,
    updateStoreHistoryParams,
    changePage,
    changePageSize,
    resetFilters,
  };
};
