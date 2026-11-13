/**
 * Mobile inventory reports — always expanded, report picker + filters in
 * bottom sheets, card-based report bodies, MobilePagination footer.
 */
import { useState } from "react";
import {
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Check,
  ChevronDown,
} from "lucide-react";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import {
  MobileFilterSheet,
  MobileFilterTrigger,
  MobilePagination,
} from "../../../../../components/mobile";
import { useInventoryReportsState } from "../useInventoryReportsState";
import { renderReportContent } from "../renderReportContent";
import type { ReportType } from "../../../../../api/inventoryReport";

export const MobileInventoryReports = () => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const state = useInventoryReportsState({ enabled: true });

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
    goToPage,
    groupedReports,
  } = state;

  const SelectedIcon = meta?.icon ?? Filter;
  const activeFilterCount =
    (startDate ? 1 : 0) + (endDate ? 1 : 0);

  return (
    <div className='space-y-3'>
      {/* Section header — tap the report label to open the picker */}
      <div className='flex items-center justify-between gap-2'>
        <button
          onClick={() => setPickerOpen(true)}
          className='flex items-center gap-2.5 min-w-0 flex-1 text-left rounded-xl hover:bg-muted/60 transition-colors -mx-1 px-1 py-1'>
          <div className='h-9 w-9 rounded-xl bg-primary/10 grid place-items-center shrink-0'>
            <SelectedIcon className='h-4 w-4 text-primary' />
          </div>
          <span className='min-w-0 flex-1'>
            <span className='block text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>
              Inventory reports
            </span>
            <span className='flex items-center gap-1'>
              <span className='text-sm font-semibold truncate'>
                {meta?.label}
              </span>
              <ChevronDown className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
            </span>
          </span>
        </button>
        <div className='flex items-center gap-1.5 shrink-0'>
          <MobileFilterTrigger
            onClick={() => setFiltersOpen(true)}
            activeCount={activeFilterCount}
            className='h-9 w-9'
          />
          <Button
            variant='ghost'
            size='icon'
            className='h-9 w-9 rounded-full'
            onClick={refetch}
            disabled={loading}
            aria-label='Refresh report'>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Report body */}
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

      {/* Pagination */}
      {isPaginated && pagination && (
        <MobilePagination
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          onChange={goToPage}
        />
      )}

      {/* Report picker sheet */}
      <MobileFilterSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title='Choose a report'
        onApply={() => setPickerOpen(false)}>
        <div className='space-y-1'>
          {groupedReports.map(({ catKey, category, reports }) => (
            <div key={catKey}>
              <div className='flex items-center gap-1.5 px-1 pt-3 pb-1'>
                <category.icon className='h-3.5 w-3.5 text-[#D97757]' />
                <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
                  {category.label}
                </span>
              </div>
              {reports.map(({ key, meta: m }) => {
                const isActive = selectedReport === key;
                const Icon = m.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedReport(key as ReportType);
                      setPickerOpen(false);
                    }}
                    className='w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left hover:bg-muted transition-colors'>
                    <Icon className='h-4 w-4 shrink-0 text-muted-foreground' />
                    <span className='flex-1 min-w-0'>
                      <span className='block text-[13px] font-medium truncate'>
                        {m.label}
                      </span>
                      <span className='block text-[11px] text-muted-foreground truncate'>
                        {m.description}
                      </span>
                    </span>
                    {isActive && (
                      <Check className='h-4 w-4 shrink-0 text-[#C96442]' />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </MobileFilterSheet>

      {/* Date filters sheet (reports that support a server-side range) */}
      <MobileFilterSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title='Report filters'
        onApply={() => setFiltersOpen(false)}
        onReset={clearDates}>
        <div className='space-y-4'>
          {supportsDateRange ? (
            <div className='space-y-2'>
              <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5'>
                <Calendar className='h-3.5 w-3.5' /> Date range
              </p>
              <Input
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className='h-10 rounded-xl'
                aria-label='Start date'
              />
              <Input
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className='h-10 rounded-xl'
                aria-label='End date'
              />
              {(startDate || endDate) && (
                <button
                  onClick={clearDates}
                  className='text-xs font-medium text-[#9A4B2E]'>
                  Clear dates
                </button>
              )}
            </div>
          ) : (
            <p className='text-[13px] text-muted-foreground'>
              This report has no filters — switch reports to filter by date
              range.
            </p>
          )}
        </div>
      </MobileFilterSheet>
    </div>
  );
};

export default MobileInventoryReports;
