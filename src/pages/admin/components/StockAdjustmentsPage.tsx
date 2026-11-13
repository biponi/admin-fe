import React, { useState, useEffect } from "react";
import { useStockAdjustments } from "../../../hooks/useStockAdjustments";
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
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  RotateCcw,
  ArrowUpDown,
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
  MobileStatRow,
  MobileStatTile,
} from "../../../components/mobile";
import { PageHeader } from "../../../components/PageHeader";

export const StockAdjustmentsPage: React.FC = () => {
  const { toast } = useToast();
  const {
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
    setCurrentPage,
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
  } = useStockAdjustments();

  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue, 500);
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

  const handleDirectionFilter = (dir: "increase" | "decrease" | "") => {
    setDirection(dir);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type: "add" | "remove" | "set" | "") => {
    setAdjustmentType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setInputValue(value);
  };

  const handleReset = () => {
    setInputValue("");
    resetFilters();
  };

  const SortIcon = ({ field }: { field: string }) => (
    <ArrowUpDown
      className={`h-3 w-3 ml-1 inline ${
        sortBy === field ? "text-primary" : "text-slate-400"
      }`}
    />
  );

  if (isLoading && adjustments.length === 0) {
    if (isMobile) {
      return (
        <MobilePage title='Stock Adjustments' back>
          <div className='space-y-3 px-4 pt-4'>
            <MobileSkeletonList count={5} />
          </div>
        </MobilePage>
      );
    }
    return (
      <div className='container space-y-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-primary/20 rounded-full animate-ping' />
              <div className='relative h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-sm'>
                <Package className='h-6 w-6 text-primary-foreground' />
              </div>
            </div>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-foreground'>
                Loading Stock Adjustments
              </h3>
              <p className='text-[13px] text-slate-400 mt-1'>
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
      <div className='container space-y-6'>
        <div className='bg-rose-50 border border-rose-200 rounded-xl p-4'>
          <p className='text-sm text-rose-700'>Error: {error}</p>
        </div>
      </div>
    );
  }

  // ── Mobile: filter controls + card list ──
  if (isMobile) {
    return (
      <MobilePage
        title='Stock Adjustments'
        icon={<RotateCcw className='h-5 w-5 text-primary' />}
        subtitle='Product inventory adjustments'
        back>
        <div className='space-y-3 px-4 pt-3 pb-6'>
          {/* Filters */}
          <div className='space-y-2 rounded-2xl border bg-card p-3'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
              <input
                type='text'
                placeholder='Search product, SKU, reason...'
                value={inputValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className='w-full pl-9 pr-3 py-2.5 text-[13px] border border-slate-200 rounded-full bg-white text-foreground focus:outline-none focus:border-zinc-400'
              />
            </div>
            <div className='flex items-center gap-1.5'>
              {[
                { label: "All", value: "" as const },
                { label: "Increase", value: "increase" as const },
                { label: "Decrease", value: "decrease" as const },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleDirectionFilter(tab.value)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    direction === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-slate-200 bg-white text-slate-600"
                  }`}>
                  {tab.label}
                </button>
              ))}
              <select
                value={adjustmentType}
                onChange={(e) =>
                  handleTypeFilter(e.target.value as "add" | "remove" | "set" | "")
                }
                className='ml-auto rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] text-slate-600'>
                <option value=''>All Types</option>
                <option value='add'>Add</option>
                <option value='remove'>Remove</option>
                <option value='set'>Set</option>
              </select>
              <button
                onClick={handleReset}
                aria-label='Reset filters'
                className='grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600'>
                <RotateCcw className='h-3.5 w-3.5' />
              </button>
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
            </div>
          </div>

          {/* Summary */}
          <MobileStatRow>
            <MobileStatTile
              label='Total'
              value={pagination?.totalItems?.toLocaleString() || "0"}
              icon={<Package className='h-4 w-4' />}
            />
            <MobileStatTile
              label='Increases'
              value={summary?.totalIncreases?.toLocaleString() || "0"}
              icon={<TrendingUp className='h-4 w-4' />}
              tone='bg-emerald-100 text-emerald-700'
            />
            <MobileStatTile
              label='Decreases'
              value={summary?.totalDecreases?.toLocaleString() || "0"}
              icon={<TrendingDown className='h-4 w-4' />}
              tone='bg-rose-100 text-rose-700'
            />
          </MobileStatRow>

          {/* List */}
          {isLoading ? (
            <MobileSkeletonList count={5} />
          ) : adjustments.length === 0 ? (
            <MobileEmptyState
              icon={<Package className='h-7 w-7' />}
              title='No stock adjustments'
              description='Nothing matches the current filters'
            />
          ) : (
            <MobileStaggeredList key={`${currentPage}-${sortBy}-${sortOrder}`}>
              {adjustments.map((item) => (
                <MobileListCard
                  key={item.id}
                  title={item.productName}
                  subtitle={
                    <span>
                      <span className='font-mono'>{item.productSku}</span> ·{" "}
                      {item.oldQuantity} → {item.newQuantity}
                      {item.reason ? ` · ${item.reason}` : ""}
                    </span>
                  }
                  trailing={
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        item.quantityChange > 0
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}>
                      {item.quantityChange > 0 ? "+" : ""}
                      {item.quantityChange}
                    </span>
                  }
                  badge={
                    <Badge
                      variant='outline'
                      className={
                        item.adjustmentType === "add"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : item.adjustmentType === "remove"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                      }>
                      {item.adjustmentType}
                    </Badge>
                  }
                >
                  <div className='mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground'>
                    <span className='font-medium text-foreground'>
                      {item.adjustedBy.userName}
                    </span>
                    <span>
                      {dayjs(item.timestamps.createdAt).format("MMM D, YYYY h:mm A")}
                    </span>
                  </div>
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
        icon={<RotateCcw className='h-5 w-5 text-white' />}
        title='Stock Adjustments'
        subtitle='Paginated list of all product inventory adjustments'
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
            placeholder='Search product, SKU, reason...'
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='w-full pl-9 pr-3 py-2 text-[13px] border border-slate-200 rounded-md bg-white text-foreground focus:outline-none focus:border-zinc-400'
          />
        </div>

        {/* Direction Filter Tabs */}
        <div className='flex items-center gap-1'>
          {[
            { label: "All", value: "" as const },
            { label: "Increase", value: "increase" as const },
            { label: "Decrease", value: "decrease" as const },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleDirectionFilter(tab.value)}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                direction === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-accent hover:text-foreground hover:border-zinc-400"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Adjustment Type Filter */}
        <select
          value={adjustmentType}
          onChange={(e) =>
            handleTypeFilter(e.target.value as "add" | "remove" | "set" | "")
          }
          className='px-3 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white text-slate-600 focus:outline-none focus:border-zinc-400'>
          <option value=''>All Types</option>
          <option value='add'>Add</option>
          <option value='remove'>Remove</option>
          <option value='set'>Set</option>
        </select>

        <button
          onClick={handleReset}
          className='px-3 py-1.5 text-[13px] font-medium rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-accent hover:text-foreground hover:border-zinc-400 flex items-center gap-1.5'>
          <RotateCcw className='h-3.5 w-3.5' />
          Reset
        </button>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
        <div className='bg-white rounded-lg border border-slate-200 p-4 shadow-[0_1px_2px_rgba(20,20,19,0.04)]'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary'>
              <Package className='h-4 w-4 text-primary' />
            </div>
            <div className='w-2 h-2 rounded-full bg-primary/50' />
          </div>
          <p className='text-lg font-semibold text-foreground tabular-nums leading-none mb-1'>
            {pagination?.totalItems?.toLocaleString() || "0"}
          </p>
          <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Total Adjustments
          </p>
        </div>
        <div className='bg-white rounded-lg border border-slate-200 p-4 shadow-[0_1px_2px_rgba(20,20,19,0.04)]'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200'>
              <TrendingUp className='h-4 w-4 text-emerald-600' />
            </div>
            <div className='w-2 h-2 rounded-full bg-primary/50' />
          </div>
          <p className='text-lg font-semibold text-emerald-600 tabular-nums leading-none mb-1'>
            {summary?.totalIncreases?.toLocaleString() || "0"}
          </p>
          <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Increases
          </p>
        </div>
        <div className='bg-white rounded-lg border border-slate-200 p-4 shadow-[0_1px_2px_rgba(20,20,19,0.04)]'>
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-rose-50 border border-rose-200'>
              <TrendingDown className='h-4 w-4 text-rose-600' />
            </div>
            <div className='w-2 h-2 rounded-full bg-primary/50' />
          </div>
          <p className='text-lg font-semibold text-rose-600 tabular-nums leading-none mb-1'>
            {summary?.totalDecreases?.toLocaleString() || "0"}
          </p>
          <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400'>
            Decreases
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className='bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(20,20,19,0.04)] overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='bg-muted/50 border-b border-slate-200 hover:bg-muted/50'>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("productName")}>
                  Product <SortIcon field='productName' />
                </TableHead>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("adjustmentType")}>
                  Type <SortIcon field='adjustmentType' />
                </TableHead>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("quantityChange")}>
                  Change <SortIcon field='quantityChange' />
                </TableHead>
                <TableHead className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                  Old → New
                </TableHead>
                <TableHead
                  className='cursor-pointer select-none text-[10px] font-semibold text-slate-400 uppercase tracking-wider'
                  onClick={() => handleSort("reason")}>
                  Reason <SortIcon field='reason' />
                </TableHead>
                <TableHead className='text-[10px] font-semibold text-slate-400 uppercase tracking-wider'>
                  Adjusted By
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
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className='h-4 bg-slate-100 rounded animate-pulse' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className='text-center py-12'>
                      <Package className='w-12 h-12 mx-auto mb-3 text-slate-300' />
                      <p className='text-sm text-slate-500'>
                        No stock adjustments found
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((item) => (
                  <TableRow
                    key={item.id}
                    className='hover:bg-muted/50 transition-colors duration-200 border-b border-slate-200/70'>
                    <TableCell>
                      <div>
                        <p className='text-[13px] font-semibold text-foreground'>
                          {item.productName}
                        </p>
                        <p className='text-[11px] text-slate-400 font-mono'>
                          {item.productSku}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className={
                          item.adjustmentType === "add"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.adjustmentType === "remove"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                        }>
                        {item.adjustmentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm font-medium ${
                          item.quantityChange > 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}>
                        {item.quantityChange > 0 ? "+" : ""}
                        {item.quantityChange}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='text-[13px] text-slate-600 tabular-nums'>
                        {item.oldQuantity} → {item.newQuantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p
                        className='text-[13px] text-slate-600 max-w-[200px] truncate'
                        title={item.reason}>
                        {item.reason}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className='text-[13px] font-medium text-foreground'>
                        {item.adjustedBy.userName}
                      </p>
                      <p className='text-[10px] text-slate-400'>
                        {item.adjustedBy.userType}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className='text-[13px] font-semibold text-foreground'>
                        {dayjs(item.timestamps.createdAt).format("MMM D, YYYY")}
                      </p>
                      <p className='text-[10px] text-slate-400 font-mono tabular-nums'>
                        {dayjs(item.timestamps.createdAt).format("h:mm A")}
                      </p>
                    </TableCell>
                  </TableRow>
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
