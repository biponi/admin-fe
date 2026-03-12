import { useState, useCallback, useEffect } from "react";
import { getReserveStore } from "../../../api/reserve";
import { IRecord, PaginationInfo, IStoreReservePaginated } from "../interface";
import toast from "react-hot-toast";

interface UseReserveRecordsResult {
  records: IRecord[];
  storeInfo: Omit<IStoreReservePaginated, "records"> | null;
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageLimit: number;
  setCurrentPage: (page: number) => void;
  setPageLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refreshRecords: () => Promise<void>;
}

export const useReserveRecords = (storeId?: string): UseReserveRecordsResult => {
  const [records, setRecords] = useState<IRecord[]>([]);
  const [storeInfo, setStoreInfo] = useState<Omit<IStoreReservePaginated, "records"> | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(20);

  /**
   * Fetch records with pagination
   */
  const fetchRecords = useCallback(async () => {
    if (!storeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getReserveStore(storeId, currentPage, pageLimit);

      if (response?.success && response?.data) {
        const data = response.data as IStoreReservePaginated;

        setRecords(data.records || []);
        setPagination(data.pagination || null);
        setStoreInfo({
          id: data.id,
          name: data.name,
          location: data.location,
          timestamp: data.timestamp,
          slug: data.slug,
          pagination: data.pagination,
        });
      } else {
        const errorMessage = response?.error || "Failed to fetch store records";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        err.message ||
        "Failed to fetch store records";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, currentPage, pageLimit]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, pagination]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  /**
   * Change page limit and reset to first page
   */
  const changePageLimit = useCallback((limit: number) => {
    setPageLimit(limit);
    setCurrentPage(1);
  }, []);

  /**
   * Fetch records on mount and when pagination changes
   */
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    storeInfo,
    pagination,
    isLoading,
    error,
    currentPage,
    pageLimit,
    setCurrentPage,
    setPageLimit: changePageLimit,
    nextPage,
    prevPage,
    refreshRecords: fetchRecords,
  };
};
