/**
 * Shared state controller for the inventory reports section.
 *
 * Owns report selection, search, date-range filters, and the paginated
 * fetch — consumed by both the desktop InventoryReportsSection and the
 * mobile MobileInventoryReports tree, so data logic exists once.
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { ReportType } from "../../../../api/inventoryReport";
import { usePaginatedInventoryReport } from "../../../../hooks/useInventoryReport";
import { reportRegistry, reportCategories } from "./reportScaffold/reportRegistry";

export function useInventoryReportsState(options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};
  const [selectedReport, setSelectedReport] = useState<ReportType>("inventory-summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const meta = reportRegistry[selectedReport];
  const supportsDateRange = !!meta?.dateRange;
  const isPaginated = !!meta?.paginated;

  const baseParams = useMemo(() => {
    const params: Record<string, any> = { type: selectedReport };
    if (supportsDateRange && startDate) params.startDate = startDate;
    if (supportsDateRange && endDate) params.endDate = endDate;
    return params;
  }, [selectedReport, supportsDateRange, startDate, endDate]);

  const {
    data,
    loading,
    error,
    refetch,
    pagination,
    currentPage,
    pageSize,
    goToPage,
    changePageSize,
  } = usePaginatedInventoryReport(baseParams as any, 1, 20, {
    enabled,
  });

  // Clear the date filters when switching to a report that doesn't use them
  useEffect(() => {
    if (!supportsDateRange) {
      setStartDate("");
      setEndDate("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport]);

  const clearDates = useCallback(() => {
    setStartDate("");
    setEndDate("");
  }, []);

  /** Reports grouped by category, filtered by the search query. */
  const groupedReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return Object.entries(reportCategories)
      .map(([catKey, category]) => ({
        catKey,
        category,
        reports: Object.entries(reportRegistry)
          .filter(([_, m]) => m.category === catKey)
          .filter(([_, m]) => {
            if (!q) return true;
            return (
              m.label.toLowerCase().includes(q) ||
              m.description.toLowerCase().includes(q)
            );
          })
          .map(([key, m]) => ({ key: key as ReportType, meta: m })),
      }))
      .filter((group) => group.reports.length > 0);
  }, [searchQuery]);

  return {
    selectedReport,
    setSelectedReport,
    searchQuery,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearDates,
    meta,
    supportsDateRange,
    isPaginated,
    data,
    loading,
    error,
    refetch,
    pagination,
    currentPage,
    pageSize,
    goToPage,
    changePageSize,
    groupedReports,
  };
}

export type InventoryReportsState = ReturnType<typeof useInventoryReportsState>;
