import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Check,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { claude } from "../../../../lib/claude";
import { cn } from "../../../../lib/utils";
import { useInventoryReportsState } from "./useInventoryReportsState";
import { renderReportContent } from "./renderReportContent";
import type { ReportType } from "../../../../api/inventoryReport";

// ─── Pagination footer (shared by both layouts) ──────────────────────────────

const ReportPagination = ({
  pagination,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => {
  if (!pagination || pagination.totalItems === 0) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, pagination.totalItems);

  return (
    <div className='flex items-center justify-between px-1 pt-3 flex-wrap gap-2'>
      <p className='text-xs text-[#8A877D]'>
        Showing {from}–{to} of{" "}
        <span className='font-medium text-[#57554D]'>
          {pagination.totalItems.toLocaleString()}
        </span>
      </p>
      <div className='flex items-center gap-2'>
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className='h-8 w-[104px] text-xs rounded-lg border-[#E8E4DC] bg-white'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPreviousPage}
          className={cn(claude.btnOutline, "h-8 text-xs")}>
          <ChevronLeft className='h-3.5 w-3.5 mr-0.5' />
          Prev
        </Button>
        <span className='text-xs text-[#57554D] px-1'>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage}
          className={cn(claude.btnOutline, "h-8 text-xs")}>
          Next
          <ChevronRight className='h-3.5 w-3.5 ml-0.5' />
        </Button>
      </div>
    </div>
  );
};

// ─── Date range filter (visible at all breakpoints) ──────────────────────────

const DateRangeFilter = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  onClear,
}: {
  startDate: string;
  endDate: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onClear: () => void;
}) => (
  <div className='flex items-center flex-wrap gap-1.5 text-xs text-[#57554D]'>
    <Calendar className='h-3.5 w-3.5 text-[#8A877D] shrink-0' />
    <Input
      type='date'
      value={startDate}
      onChange={(e) => onStartChange(e.target.value)}
      className={cn(claude.input, 'h-8 w-[142px] px-2 text-xs rounded-lg')}
      aria-label='Start date'
    />
    <span className='text-[#D8D3C8]'>–</span>
    <Input
      type='date'
      value={endDate}
      onChange={(e) => onEndChange(e.target.value)}
      className={cn(claude.input, 'h-8 w-[142px] px-2 text-xs rounded-lg')}
      aria-label='End date'
    />
    {(startDate || endDate) && (
      <button
        onClick={onClear}
        className='text-xs font-medium text-[#9A4B2E] hover:text-[#B85A3D] px-1.5 py-1 rounded-md hover:bg-[#F5F1EA] transition-colors'>
        All time
      </button>
    )}
  </div>
);

// ─── Report picker items ─────────────────────────────────────────────────────

const ReportNavList = ({
  groupedReports,
  selectedReport,
  onSelect,
}: {
  groupedReports: ReturnType<typeof useInventoryReportsState>["groupedReports"];
  selectedReport: ReportType;
  onSelect: (key: ReportType) => void;
}) => (
  <div className='space-y-1.5 pb-2'>
    {groupedReports.map(({ catKey, category, reports }) => (
      <div key={catKey} className='space-y-0.5'>
        <div className='flex items-center gap-2 px-2.5 pt-2.5 pb-1'>
          <category.icon className='h-3.5 w-3.5 text-[#D97757]' />
          <span className='text-[11px] font-semibold uppercase tracking-wider text-[#8A877D]'>
            {category.label}
          </span>
          <span className='text-[10px] text-[#8A877D] bg-[#F5F1EA] rounded-full px-1.5 py-0.5 leading-none'>
            {reports.length}
          </span>
        </div>
        {reports.map(({ key, meta }) => {
          const isActive = selectedReport === key;
          const Icon = meta.icon;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={cn(
                "w-full text-left pl-3 pr-2.5 py-2 rounded-lg text-[13px] transition-colors duration-150 flex items-start gap-2",
                isActive
                  ? "bg-[#D97757]/[0.08] hover:bg-[#D97757]/[0.12]"
                  : "hover:bg-[#F5F1EA]",
              )}>
              <span
                className={cn(
                  "mt-0.5 h-4 w-0.5 rounded-full shrink-0",
                  isActive ? "bg-[#D97757]" : "bg-transparent",
                )}
              />
              <Icon
                className={cn(
                  "h-3.5 w-3.5 mt-0.5 shrink-0",
                  isActive ? "text-[#C96442]" : "text-[#8A877D]",
                )}
              />
              <span className='min-w-0'>
                <span
                  className={cn(
                    "block text-xs font-medium leading-tight",
                    isActive ? "text-[#9A4B2E]" : "text-[#141413]",
                  )}>
                  {meta.label}
                </span>
                <span className='block text-[11px] mt-0.5 leading-tight text-[#8A877D]'>
                  {meta.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    ))}
  </div>
);

/** Compact report picker for < lg widths (category select + report select). */
const CompactReportPicker = ({
  groupedReports,
  selectedReport,
  onSelect,
}: {
  groupedReports: ReturnType<typeof useInventoryReportsState>["groupedReports"];
  selectedReport: ReportType;
  onSelect: (key: ReportType) => void;
}) => (
  <div className='lg:hidden space-y-2'>
    <Select
      value={selectedReport}
      onValueChange={(v) => onSelect(v as ReportType)}>
      <SelectTrigger className={cn(claude.input, 'w-full rounded-lg')}>
        <SelectValue placeholder='Choose a report' />
      </SelectTrigger>
      <SelectContent>
        {groupedReports.map(({ catKey, category, reports }) => (
          <div key={catKey}>
            <div className='flex items-center gap-1.5 px-2 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#8A877D]'>
              <category.icon className='h-3 w-3 text-[#D97757]' />
              {category.label}
            </div>
            {reports.map(({ key, meta }) => (
              <SelectItem key={key} value={key}>
                <span className='flex items-center gap-2'>
                  {selectedReport === key && (
                    <Check className='h-3.5 w-3.5 text-[#C96442]' />
                  )}
                  {meta.label}
                </span>
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const InventoryReportsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const state = useInventoryReportsState({ enabled: isOpen });
  const {
    selectedReport,
    setSelectedReport,
    searchQuery,
    setSearchQuery,
    startDate,
    endDate,
    setStartDate,
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
  } = state;

  const SelectedIcon = meta?.icon ?? Filter;

  // ── Report body (shared by both layouts) ──────────────────────────────────
  const reportBody = (
    <div key={selectedReport}>
      {renderReportContent({
        selectedReport,
        label: meta?.label ?? selectedReport,
        data,
        loading,
        error,
        refetch,
      })}
    </div>
  );

  const paginationFooter = isPaginated ? (
    <ReportPagination
      pagination={pagination}
      currentPage={currentPage}
      pageSize={pageSize}
      onPageChange={goToPage}
      onPageSizeChange={changePageSize}
    />
  ) : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger */}
      <CollapsibleTrigger asChild>
        <button className='w-full text-left group'>
          <div className='flex items-center justify-between px-1 py-0.5 gap-3'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='h-8 w-8 rounded-lg border border-[#D97757]/20 bg-[#D97757]/10 flex items-center justify-center shrink-0 group-hover:bg-[#D97757]/[0.16] transition-colors'>
                <Filter className='h-4 w-4 text-[#D97757]' />
              </div>
              <div className='min-w-0'>
                <p className={cn(claude.title, "truncate")}>
                  Advanced inventory reports
                </p>
                <p className='text-xs text-[#8A877D]'>
                  17 report types with filtering
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              <span className='hidden md:inline-flex text-xs font-medium text-[#9A4B2E] bg-[#D97757]/10 border border-[#D97757]/30 px-2.5 py-1 rounded-full'>
                {meta?.label}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[#8A877D] transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      {/* Content */}
      <CollapsibleContent>
        <div className='mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start'>
          {/* ── Sidebar nav (lg+) ──────────────────────────────────────────── */}
          <div className='hidden lg:flex lg:col-span-4 flex-col rounded-xl border border-[#E8E4DC] bg-white overflow-hidden lg:max-h-[70vh]'>
            <div className='p-3.5 border-b border-[#E8E4DC] space-y-2.5 shrink-0'>
              <p className={claude.microLabel}>Report types</p>
              <div className='relative'>
                <Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8A877D]' />
                <Input
                  type='text'
                  placeholder='Search reports…'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(claude.input, 'pl-8 h-8 rounded-lg')}
                />
              </div>
            </div>
            <div
              className='flex-1 min-h-0 overflow-y-auto px-2 py-1'
              style={{ scrollbarWidth: "thin", scrollbarColor: "#D8D3C8 transparent" }}>
              <ReportNavList
                groupedReports={groupedReports}
                selectedReport={selectedReport}
                onSelect={setSelectedReport}
              />
            </div>
          </div>

          {/* ── Compact picker (< lg) ──────────────────────────────────────── */}
          <div className='lg:hidden'>
            <CompactReportPicker
              groupedReports={groupedReports}
              selectedReport={selectedReport}
              onSelect={setSelectedReport}
            />
          </div>

          {/* ── Report display ─────────────────────────────────────────────── */}
          <div
            className={cn(
              "flex flex-col rounded-xl border border-[#E8E4DC] bg-white overflow-hidden",
              "lg:col-span-8 lg:col-start-5",
            )}>
            {/* Report header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 px-4 md:px-5 py-3.5 border-b border-[#E8E4DC] shrink-0'>
              <div className='flex items-center gap-2.5 min-w-0'>
                <div className='h-8 w-8 rounded-lg border border-[#D97757]/20 bg-[#D97757]/10 flex items-center justify-center shrink-0'>
                  <SelectedIcon className='h-4 w-4 text-[#D97757]' />
                </div>
                <div className='min-w-0'>
                  <p className={cn(claude.title, "truncate")}>{meta?.label}</p>
                  <p className='text-xs text-[#8A877D] truncate'>
                    {meta?.description}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2 shrink-0 flex-wrap'>
                {supportsDateRange && (
                  <DateRangeFilter
                    startDate={startDate}
                    endDate={endDate}
                    onStartChange={setStartDate}
                    onEndChange={setEndDate}
                    onClear={clearDates}
                  />
                )}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={refetch}
                  disabled={loading}
                  className={cn(claude.btnOutline, "h-8 text-xs shrink-0")}>
                  <RefreshCw
                    className={cn("h-3.5 w-3.5 mr-1", loading && "animate-spin")}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Report body — scrolls internally; tables handle their own x-scroll */}
            <div className='flex-1 min-w-0 px-4 md:px-5 py-4'>
              {reportBody}
            </div>

            {/* Pagination footer */}
            {paginationFooter && (
              <div className='px-4 md:px-5 pb-3.5 shrink-0 border-t border-[#E8E4DC]'>
                {paginationFooter}
              </div>
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InventoryReportsSection;
