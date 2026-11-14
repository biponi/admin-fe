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
import { useIsMobile } from "../../../hooks/use-mobile";
import {
  MobileEmptyState,
  MobileListCard,
  MobilePage,
  MobilePagination,
  MobileSkeletonList,
  MobileStaggeredList,
  MobileStatTile,
} from "../../../components/mobile";
import { PageHeader } from "../../../components/PageHeader";
import { PageLoader } from "@/components/loaders";

interface ProductLike {
  name: string;
  quantity: number;
  variation?: { color?: string; size?: string };
}

// "ss108 (Black - 36) x2" — matches the format the backend reason line uses
const formatProduct = (p: ProductLike) =>
  `${p.name} (${
    [p.variation?.color, p.variation?.size].filter(Boolean).join(" - ") || "—"
  }) x${p.quantity}`;

const formatAuditValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    // product-like arrays: every element has name + quantity
    const isProductList =
      value.length > 0 &&
      value.every(
        (v) => v && typeof v === "object" && "name" in v && "quantity" in v,
      );
    return isProductList
      ? value.map(formatProduct).join(", ")
      : JSON.stringify(value);
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

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
  const isMobile = useIsMobile();

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
        sortBy === field ? "text-primary" : "text-slate-400"
      }`}
    />
  );

  if (isLoading && modifications.length === 0) {
    if (isMobile) {
      return (
        <MobilePage title='Order Modifications' back>
          <div className='space-y-3 px-4 pt-4'>
            <MobileSkeletonList count={5} />
          </div>
        </MobilePage>
      );
    }
    return (
      <div className='container space-y-6'>
        <PageLoader domain='orders' text='Loading Order Modifications' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container space-y-6'>
        <div className='bg-rose-50 border border-rose-200 rounded-xl p-4'>
          <p className='text-sm text-rose-700'>Error: {error}</p>
        </div>
      </div>
    );
  }

  // ── Mobile: expandable card list ──
  if (isMobile) {
    return (
      <MobilePage
        title='Order Modifications'
        icon={<FileEdit className='h-5 w-5 text-primary' />}
        subtitle='Order modification audit logs'
        back>
        <div className='space-y-3 px-4 pt-3 pb-6'>
          {/* Filters */}
          <div className='space-y-2 rounded-2xl border bg-card p-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <input
                type='text'
                placeholder='Search order #, description, reason...'
                value={inputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className='w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 rounded-full bg-white text-foreground focus:outline-none focus:border-zinc-400'
              />
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='datetime-local'
                value={
                  dateRange.startDate
                    ? dayjs(dateRange.startDate).format("YYYY-MM-DDTHH:mm")
                    : ""
                }
                onChange={(e) => {
                  setDateRange({
                    ...dateRange,
                    startDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  });
                  setCurrentPage(1);
                }}
                className='min-w-0 flex-1 px-2 py-1.5 text-[12px] border border-slate-200 rounded-md bg-white text-foreground focus:outline-none focus:border-zinc-400'
              />
              <input
                type='datetime-local'
                value={
                  dateRange.endDate
                    ? dayjs(dateRange.endDate).format("YYYY-MM-DDTHH:mm")
                    : ""
                }
                onChange={(e) => {
                  const endOfDay = e.target.value
                    ? dayjs(e.target.value).endOf("day").toISOString()
                    : undefined;
                  setDateRange({ ...dateRange, endDate: endOfDay });
                  setCurrentPage(1);
                }}
                className='min-w-0 flex-1 px-2 py-1.5 text-[12px] border border-slate-200 rounded-md bg-white text-foreground focus:outline-none focus:border-zinc-400'
              />
              <button
                onClick={handleReset}
                aria-label='Reset filters'
                className='grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600'>
                <RotateCcw className='h-3.5 w-3.5' />
              </button>
            </div>
          </div>

          <div className='flex flex-col gap-1.5 rounded-2xl border bg-card p-3'>
            <span className='text-lg font-semibold tabular-nums'>
              {pagination?.totalItems?.toLocaleString() || "0"}
            </span>
            <span className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
              Total Modifications
            </span>
          </div>

          {/* List */}
          {isLoading ? (
            <MobileSkeletonList count={5} />
          ) : modifications.length === 0 ? (
            <MobileEmptyState
              icon={<FileEdit className='h-7 w-7' />}
              title='No order modifications'
              description='Nothing matches the current filters'
            />
          ) : (
            <MobileStaggeredList key={`${currentPage}-${sortBy}-${sortOrder}`}>
              {modifications.map((item) => (
                <MobileListCard
                  key={item.id}
                  onClick={() => toggleRow(item.id)}
                  title={
                    <span className='font-mono text-primary'>
                      #{item.orderNumber}
                    </span>
                  }
                  subtitle={item.operationDescription}
                  trailing={
                    <span className='text-right'>
                      <span className='block text-[12px] font-semibold text-foreground'>
                        {dayjs(item.timestamps.createdAt).format("MMM D")}
                      </span>
                      <span className='block text-[10px] text-slate-400'>
                        {dayjs(item.timestamps.createdAt).format("h:mm A")}
                      </span>
                    </span>
                  }
                >
                  <div className='mt-1 flex items-center gap-2 text-[11px] text-muted-foreground'>
                    <span className='font-medium text-foreground'>
                      {item.performedBy.userName}
                    </span>
                    <span className='truncate'>{item.reason || "—"}</span>
                  </div>
                  {expandedRows.has(item.id) && (
                    <div className='mt-2.5 space-y-2 rounded-xl border border-border/60 bg-muted/40 p-3'>
                      <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                        Change Details
                      </p>
                      {item.changesummary?.map((change, idx) => (
                        <div
                          key={idx}
                          className='flex flex-wrap items-center gap-2 text-[12px]'>
                          <Badge
                            variant='outline'
                            className='rounded-md border-border bg-muted text-[10px] font-medium text-slate-500'>
                            {change.field}
                          </Badge>
                          <span className='min-w-0 break-words text-slate-400'>
                            {formatAuditValue(change.oldValue)}
                          </span>
                          <span className='text-slate-300'>→</span>
                          <span className='min-w-0 break-words font-medium text-foreground'>
                            {formatAuditValue(change.newValue)}
                          </span>
                        </div>
                      ))}
                      {item.notes && (
                        <div className='rounded-lg bg-background p-2.5'>
                          <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
                            Notes
                          </p>
                          <p className='text-[12px] text-slate-600'>{item.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </MobileListCard>
              ))}
            </MobileStaggeredList>
          )}

          <MobilePagination
            page={pagination?.currentPage ?? 1}
            totalPages={pagination?.totalPages ?? 1}
            onChange={setCurrentPage}
          />
        </div>
      </MobilePage>
    );
  }

  return (
    <div className='container space-y-6 md:pt-2'>
      {/* Header */}
      <PageHeader
        icon={<FileEdit className='h-5 w-5 text-white' />}
        title='Order Modifications'
        subtitle='Paginated list of all order modification audit logs'
        count={
          pagination?.totalItems != null ? (
            <span className='rounded-md px-2.5 py-1 text-base font-semibold text-slate-500 tabular-nums'>
              {pagination.totalItems} total
            </span>
          ) : undefined
        }
        actions={
          <div className='flex items-center gap-2'>
            <input
              type='datetime-local'
              value={
                dateRange.startDate
                  ? dayjs(dateRange.startDate).format("YYYY-MM-DDTHH:mm")
                  : ""
              }
              onChange={(e) => {
                setDateRange({
                  ...dateRange,
                  startDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                });
                setCurrentPage(1);
              }}
              className='px-3 py-2 text-[13px] border border-slate-200 rounded-md bg-white text-foreground focus:outline-none focus:border-zinc-400'
            />
            <span className='text-[13px] text-slate-400'>to</span>
            <input
              type='datetime-local'
              value={
                dateRange.endDate
                  ? dayjs(dateRange.endDate).format("YYYY-MM-DDTHH:mm")
                  : ""
              }
              onChange={(e) => {
                const endOfDay = e.target.value
                  ? dayjs(e.target.value).endOf("day").toISOString()
                  : undefined;
                setDateRange({ ...dateRange, endDate: endOfDay });
                setCurrentPage(1);
              }}
              className='px-3 py-2 text-[13px] border border-slate-200 rounded-md bg-white text-foreground focus:outline-none focus:border-zinc-400'
            />
          </div>
        }
      />

      {/* Filter Bar */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
        <div className='relative flex-1 sm:w-64'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
          <input
            type='text'
            placeholder='Search order #, description, reason...'
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='w-full pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-md bg-white text-foreground focus:outline-none focus:border-zinc-400'
          />
        </div>

        <button
          onClick={handleReset}
          className='px-3 py-1.5 text-[13px] font-medium rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400 flex items-center gap-1.5'>
          <RotateCcw className='h-3.5 w-3.5' />
          Reset
        </button>
      </div>

      {/* Summary Card */}
      <div className='grid grid-cols-1 sm:grid-cols-1 gap-3'>
        <div className='bg-white rounded-lg border border-slate-200 p-4 shadow-[0_1px_2px_rgba(20,20,19,0.04)]'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary'>
              <FileEdit className='h-4 w-4 text-primary' />
            </div>
            <div className='w-2 h-2 rounded-full bg-primary/50' />
          </div>
          <p className='text-lg font-semibold text-foreground tabular-nums leading-none mb-1'>
            {pagination?.totalItems?.toLocaleString() || "0"}
          </p>
          <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Total Modifications
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className='bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50 border-b border-slate-200 hover:bg-muted/50'>
                <TableHead className='w-8'></TableHead>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("orderNumber")}>
                  Order # <SortIcon field='orderNumber' />
                </TableHead>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("operationDescription")}>
                  Description <SortIcon field='operationDescription' />
                </TableHead>
                <TableHead className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                  Changed By
                </TableHead>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("reason")}>
                  Reason <SortIcon field='reason' />
                </TableHead>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("createdAt")}>
                  Date <SortIcon field='createdAt' />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className='h-4 bg-slate-100 rounded animate-pulse' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : modifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className='text-center py-12'>
                      <FileEdit className='w-12 h-12 mx-auto mb-3 text-slate-300' />
                      <p className='text-sm text-slate-500'>
                        No order modifications found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                modifications.map((item) => (
                  <React.Fragment key={item.id}>
                    <TableRow
                      className='hover:bg-muted/50 transition-colors duration-200 cursor-pointer border-b border-slate-200/70'
                      onClick={() => toggleRow(item.id)}>
                      <TableCell>
                        {expandedRows.has(item.id) ? (
                          <ChevronDown className='h-4 w-4 text-slate-400' />
                        ) : (
                          <ChevronRight className='h-4 w-4 text-slate-400' />
                        )}
                      </TableCell>
                      <TableCell>
                        <span className='text-[13px] font-semibold text-primary font-mono'>
                          #{item.orderNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className='text-[13px] text-slate-600 max-w-[300px] truncate'>
                          {item.operationDescription}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className='text-[13px] font-medium text-foreground'>
                          {item.performedBy.userName}
                        </p>
                        <p className='text-[10px] text-slate-400'>
                          {item.performedBy.userType}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p
                          className='text-[13px] text-slate-600 max-w-[200px] truncate'
                          title={item.reason || ""}>
                          {item.reason || "—"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className='text-[13px] font-semibold text-foreground'>
                          {dayjs(item.timestamps.createdAt).format(
                            "MMM D, YYYY",
                          )}
                        </p>
                        <p className='text-[10px] text-slate-400 font-mono tabular-nums'>
                          {dayjs(item.timestamps.createdAt).format("h:mm A")}
                        </p>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(item.id) &&
                      item.changesummary &&
                      item.changesummary.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className='bg-muted/40'>
                            <div className='p-4'>
                              <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2'>
                                Change Details
                              </p>
                              <div className='space-y-2'>
                                {item.changesummary.map((change, idx) => (
                                  <div
                                    key={idx}
                                    className='flex flex-wrap items-center gap-3 text-[13px]'>
                                    <Badge
                                      variant='outline'
                                      className='rounded-md border-border bg-muted text-[10px] font-medium text-slate-500'>
                                      {change.field}
                                    </Badge>
                                    <span className='min-w-0 break-words text-slate-400'>
                                      {formatAuditValue(change.oldValue)}
                                    </span>
                                    <span className='text-slate-300'>→</span>
                                    <span className='min-w-0 break-words text-foreground font-medium'>
                                      {formatAuditValue(change.newValue)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              {item.notes && (
                                <div className='mt-3 p-3 bg-white rounded-md border border-slate-200'>
                                  <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1'>
                                    Notes
                                  </p>
                                  <p className='text-[13px] text-slate-600'>
                                    {item.notes}
                                  </p>
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
          <div className='flex items-center justify-between px-4 py-3 border-t border-slate-200'>
            <p className='text-[13px] text-slate-400'>
              Showing{" "}
              <span className='font-medium text-foreground tabular-nums'>
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className='font-medium text-foreground tabular-nums'>
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems,
                )}
              </span>{" "}
              of{" "}
              <span className='font-medium text-foreground tabular-nums'>
                {pagination.totalItems.toLocaleString()}
              </span>{" "}
              items
            </p>
            <div className='flex items-center gap-2'>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className='px-2 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white text-slate-600'>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
              <button
                onClick={prevPage}
                disabled={!pagination.hasPreviousPage}
                className='px-3 py-1.5 text-[13px] font-medium rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed'>
                Previous
              </button>
              <span className='text-[13px] text-slate-600 tabular-nums'>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={!pagination.hasNextPage}
                className='px-3 py-1.5 text-[13px] font-medium rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed'>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
