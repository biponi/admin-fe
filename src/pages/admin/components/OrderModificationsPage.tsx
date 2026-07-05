import React, { useState, useEffect } from "react";
import { useOrderModifications } from "../../../hooks/useOrderModifications";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import {
  FileEdit,
  Search,
  RotateCcw,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import dayjs from "dayjs";
import useDebounce from "../../../customHook/useDebounce";
import { useToast } from "../../../components/ui/use-toast";

export const OrderModificationsPage: React.FC = () => {
  const { toast } = useToast();
  const {
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
    setCurrentPage,
    setLimit,
    setSortBy,
    setSortOrder,
    setDateRange,
    setSearchQuery,
    nextPage,
    prevPage,
    resetFilters,
  } = useOrderModifications();

  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 500);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSearchQuery(debouncedSearch);
    if (debouncedSearch) setCurrentPage(1);
  }, [debouncedSearch]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);
  };

  const handleReset = () => {
    setInputValue("");
    resetFilters();
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const SortIcon = ({ field }: { field: string }) => (
    <ArrowUpDown
      className={`h-3 w-3 ml-1 inline ${
        sortBy === field ? "text-indigo-600" : "text-slate-400"
      }`}
    />
  );

  if (isLoading && modifications.length === 0) {
    return (
      <div className="container space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Loading Order Modifications
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Please wait while we gather the data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container space-y-6">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
          <p className="text-sm text-rose-700">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 shadow-sm shadow-indigo-200">
            <FileEdit className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 leading-tight">
              Order Modifications
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Paginated list of all order modification audit logs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={dateRange.startDate ? dayjs(dateRange.startDate).format("YYYY-MM-DDTHH:mm") : ""}
            onChange={(e) => {
              setDateRange({ ...dateRange, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined });
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="text-sm text-slate-500">to</span>
          <input
            type="datetime-local"
            value={dateRange.endDate ? dayjs(dateRange.endDate).format("YYYY-MM-DDTHH:mm") : ""}
            onChange={(e) => {
              const endOfDay = e.target.value ? dayjs(e.target.value).endOf("day").toISOString() : undefined;
              setDateRange({ ...dateRange, endDate: endOfDay });
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, description, reason..."
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
              <FileEdit className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="w-2 h-2 rounded-full bg-slate-200" />
          </div>
          <p className="text-lg font-semibold text-indigo-600 leading-none mb-1">
            {pagination?.totalItems?.toLocaleString() || "0"}
          </p>
          <p className="text-xs text-slate-500">Total Modifications</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-8"></TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("orderNumber")}>
                  Order # <SortIcon field="orderNumber" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("operationDescription")}>
                  Description <SortIcon field="operationDescription" />
                </TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("reason")}>
                  Reason <SortIcon field="reason" />
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("createdAt")}>
                  Date <SortIcon field="createdAt" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : modifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="text-center py-12">
                      <FileEdit className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="text-sm text-slate-500">
                        No order modifications found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                modifications.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => toggleRow(item.id)}>
                      <TableCell>
                        {expandedRows.has(item.id) ? (
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-slate-900">
                          #{item.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600 max-w-[300px] truncate">
                          {item.operationDescription}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-900">
                          {item.performedBy.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.performedBy.userType}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p
                          className="text-sm text-slate-600 max-w-[200px] truncate"
                          title={item.reason || ""}>
                          {item.reason || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">
                          {dayjs(item.timestamps.createdAt).format("MMM D, YYYY")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {dayjs(item.timestamps.createdAt).format("h:mm A")}
                        </p>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(item.id) && item.changesummary && item.changesummary.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-slate-50">
                          <div className="p-4">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                              Change Details
                            </p>
                            <div className="space-y-2">
                              {item.changesummary.map((change, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 text-sm">
                                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                                    {change.field}
                                  </Badge>
                                  <span className="text-slate-500">
                                    {String(change.oldValue)}
                                  </span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-slate-900 font-medium">
                                    {String(change.newValue)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {item.notes && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                                <p className="text-xs font-medium text-slate-500 mb-1">Notes</p>
                                <p className="text-sm text-slate-700">{item.notes}</p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {pagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-900">
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-900">
                {pagination.totalItems.toLocaleString()}
              </span>{" "}
              items
            </p>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700">
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <button
                onClick={prevPage}
                disabled={!pagination.hasPreviousPage}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
