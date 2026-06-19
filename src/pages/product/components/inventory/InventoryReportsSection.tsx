import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Filter,
  RefreshCw,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Input } from "../../../../components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../../components/ui/collapsible";
import {
  REPORT_TYPES,
  REPORT_CATEGORIES,
} from "../../../../utils/inventoryReportUtils";
import { ReportType } from "../../../../api/inventoryReport";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import {
  useInventoryReport,
  invalidateInventoryReportCache,
} from "../../../../hooks/useInventoryReport";
import { InventorySummaryCards } from "./reports/InventorySummaryCards";
import { LowStockTable } from "./reports/LowStockTable";
import { OutOfStockTable } from "./reports/OutOfStockTable";
import { InventoryDistributionChart } from "./reports/InventoryDistributionChart";
import { TopSellingTable } from "./reports/TopSellingTable";
import { SalesActivityTable } from "./reports/SalesActivityTable";
import { ReturnRateTable } from "./reports/ReturnRateTable";
import { DeadStockTable } from "./reports/DeadStockTable";
import { TopRatedTable } from "./reports/TopRatedTable";
import { RatingDistributionChart } from "./reports/RatingDistributionChart";
import { DiscountedProductsTable } from "./reports/DiscountedProductsTable";
import { HighestDiscountTable } from "./reports/HighestDiscountTable";
import { PriceDistributionChart } from "./reports/PriceDistributionChart";
import { CategoryPerformanceTable } from "./reports/CategoryPerformanceTable";
import { ManufacturerReportTable } from "./reports/ManufacturerReportTable";
import { RecentlyAddedTable } from "./reports/RecentlyAddedTable";
import { RecentlyUpdatedTable } from "./reports/RecentlyUpdatedTable";
import {
  InventorySummary,
  LowStockProduct,
  OutOfStockProduct,
  InventoryDistribution,
  TopSellingProduct,
  SalesActivityProduct,
  ReturnRateProduct,
  DeadStockProduct,
  TopRatedProduct,
  RatingDistribution,
  DiscountedProduct,
  HighestDiscountProduct,
  PriceDistribution,
  CategoryPerformance,
  ManufacturerReport,
  RecentlyAddedProduct,
  RecentlyUpdatedProduct,
} from "../../../../api/inventoryReport";

// ─── Empty / Error States ─────────────────────────────────────────────────────

const ReportLoading = () => (
  <div className='flex flex-col items-center justify-center h-full py-16'>
    <Loader2 className='h-8 w-8 text-indigo-500 animate-spin mb-3' />
    <p className='text-sm text-slate-500'>Loading report…</p>
  </div>
);

const ReportError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className='flex flex-col items-center justify-center h-full py-16 text-center px-6'>
    <div className='w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3'>
      <AlertCircle className='h-5 w-5 text-red-500' />
    </div>
    <h3 className='text-sm font-semibold text-slate-900 mb-1'>
      Failed to load report
    </h3>
    <p className='text-xs text-slate-400 mb-4 max-w-xs'>{message}</p>
    <button
      onClick={onRetry}
      className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors'>
      <RefreshCw className='h-3.5 w-3.5' />
      Try again
    </button>
  </div>
);

const ReportEmpty = () => (
  <div className='flex flex-col items-center justify-center h-full py-16 text-center px-6'>
    <div className='w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-3'>
      <Filter className='h-5 w-5 text-slate-400' />
    </div>
    <h3 className='text-sm font-semibold text-slate-900 mb-1'>
      No data available
    </h3>
    <p className='text-xs text-slate-400'>
      Unable to load report data. Please try again.
    </p>
  </div>
);

const ReportComingSoon = ({
  reportKey,
  label,
}: {
  reportKey: string;
  label: string;
}) => (
  <div className='flex flex-col items-center justify-center h-full py-16 text-center px-6'>
    <div className='w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3'>
      <Filter className='h-5 w-5 text-indigo-500' />
    </div>
    <h3 className='text-sm font-semibold text-slate-900 mb-1'>Coming soon</h3>
    <p className='text-xs text-slate-400 mb-3 max-w-xs'>
      The <span className='font-medium text-slate-600'>{label}</span> report is
      being built.
    </p>
    <span className='text-xs font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full'>
      {reportKey}
    </span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const InventoryReportsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("inventory-summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["INVENTORY_HEALTH"]),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousReportType, setPreviousReportType] =
    useState<ReportType>("inventory-summary");

  const reportParams = useMemo(
    () => ({ type: selectedReport, page: 1, limit: 20 }),
    [selectedReport],
  );

  const { data, loading, error, refetch } = useInventoryReport(reportParams, {
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen && selectedReport !== previousReportType) {
      setIsTransitioning(true);
      invalidateInventoryReportCache(selectedReport);
      invalidateInventoryReportCache(previousReportType);
      refetch().finally(() => {
        setPreviousReportType(selectedReport);
        setIsTransitioning(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReport, isOpen]);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(categoryKey) ? next.delete(categoryKey) : next.add(categoryKey);
      return next;
    });
  };

  const filteredReportTypes = Object.entries(REPORT_TYPES).filter(
    ([_, report]) => {
      if (!searchQuery) return true;
      return (
        report.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  );

  const allCategoryKeys = Object.keys(REPORT_CATEGORIES);
  const allExpanded = expandedCategories.size === allCategoryKeys.length;

  const toggleAllCategories = () => {
    setExpandedCategories(allExpanded ? new Set() : new Set(allCategoryKeys));
  };

  // ── Report renderer ────────────────────────────────────────────────────────

  const renderReportContent = () => {
    if (loading || isTransitioning) return <ReportLoading />;
    if (error) return <ReportError message={error} onRetry={refetch} />;
    if (!data?.data) return <ReportEmpty />;

    const reportData = data.data;

    switch (previousReportType) {
      case "inventory-summary":
        return (
          <InventorySummaryCards
            data={reportData?.summary as unknown as InventorySummary}
          />
        );
      case "low-stock":
        return (
          <LowStockTable
            data={reportData?.data as unknown as LowStockProduct[]}
          />
        );
      case "out-of-stock":
        return (
          <OutOfStockTable
            data={reportData?.data as unknown as OutOfStockProduct[]}
          />
        );
      case "inventory-distribution":
        return (
          <InventoryDistributionChart
            data={reportData?.data as unknown as InventoryDistribution[]}
          />
        );
      case "top-selling":
        return (
          <TopSellingTable
            data={reportData?.data as unknown as TopSellingProduct[]}
          />
        );
      case "sales-activity":
        return (
          <SalesActivityTable
            data={reportData?.data as unknown as SalesActivityProduct[]}
          />
        );
      case "return-rate":
        return (
          <ReturnRateTable
            data={reportData?.data as unknown as ReturnRateProduct[]}
          />
        );
      case "dead-stock":
        return (
          <DeadStockTable
            data={reportData?.data as unknown as DeadStockProduct[]}
          />
        );
      case "top-rated":
        return (
          <TopRatedTable
            data={reportData?.data as unknown as TopRatedProduct[]}
          />
        );
      case "rating-distribution":
        return (
          <RatingDistributionChart
            data={reportData?.data as unknown as RatingDistribution[]}
          />
        );
      case "discounted-products":
        return (
          <DiscountedProductsTable
            data={reportData?.data as unknown as DiscountedProduct[]}
          />
        );
      case "highest-discount":
        return (
          <HighestDiscountTable
            data={reportData?.data as unknown as HighestDiscountProduct[]}
          />
        );
      case "price-distribution":
        return (
          <PriceDistributionChart
            data={reportData?.data as unknown as PriceDistribution[]}
          />
        );
      case "category-performance":
        return (
          <CategoryPerformanceTable
            data={reportData?.data as unknown as CategoryPerformance[]}
          />
        );
      case "manufacturer-report":
        return (
          <ManufacturerReportTable
            data={reportData?.data as unknown as ManufacturerReport[]}
          />
        );
      case "recently-added":
        return (
          <RecentlyAddedTable
            data={reportData?.data as unknown as RecentlyAddedProduct[]}
          />
        );
      case "recently-updated":
        return (
          <RecentlyUpdatedTable
            data={reportData?.data as unknown as RecentlyUpdatedProduct[]}
          />
        );
      default:
        return (
          <ReportComingSoon
            reportKey={previousReportType}
            label={
              (REPORT_TYPES as any)[selectedReport]?.label ?? selectedReport
            }
          />
        );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger */}
      <CollapsibleTrigger asChild>
        <button className='w-full text-left group'>
          <div className='flex items-center justify-between px-1 py-0.5'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors'>
                <Filter className='h-4 w-4 text-indigo-500' />
              </div>
              <div>
                <p className='text-sm font-semibold text-slate-900'>
                  Advanced inventory reports
                </p>
                <p className='text-xs text-slate-400'>
                  17 report types with filtering
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full hidden sm:block'>
                {REPORT_TYPES[selectedReport]?.label}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      {/* Content */}
      <CollapsibleContent>
        <div className='mt-5 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[780px] lg:h-[680px]'>
          {/* LEFT — Report list */}
          <div className='lg:col-span-4 flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden'>
            {/* List header */}
            <div className='p-4 border-b border-slate-100 space-y-3 flex-shrink-0'>
              <p className='text-sm font-semibold text-slate-900'>
                Report types
              </p>

              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400' />
                <Input
                  type='text'
                  placeholder='Search reports…'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-8 h-8 text-sm rounded-xl border-slate-200 bg-slate-50 focus:bg-white'
                />
              </div>

              <button
                onClick={toggleAllCategories}
                className='w-full text-xs font-medium text-slate-500 hover:text-slate-700 py-1 transition-colors text-left'>
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>

            {/* Scrollable list */}
            <ScrollArea className='flex-1 px-3 py-3'>
              <div className='space-y-2 pb-2'>
                {Object.entries(REPORT_CATEGORIES).map(([catKey, category]) => {
                  const categoryReports = filteredReportTypes.filter(
                    ([_, report]) => report.category === catKey,
                  );
                  if (categoryReports.length === 0) return null;

                  const isExpanded = expandedCategories.has(catKey);

                  return (
                    <div key={catKey}>
                      {/* Category row */}
                      <button
                        onClick={() => toggleCategory(catKey)}
                        className='w-full flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors group'>
                        <div className='flex items-center gap-2'>
                          <span className='text-base leading-none'>
                            {category.icon}
                          </span>
                          <span className='text-xs font-semibold text-slate-700'>
                            {category.label}
                          </span>
                          <span className='text-xs text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5 leading-none'>
                            {categoryReports.length}
                          </span>
                        </div>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Report items */}
                      {isExpanded && (
                        <div className='ml-3 mt-1 mb-1 border-l border-slate-100 pl-3 space-y-0.5'>
                          {categoryReports.map(([reportKey, report]) => {
                            const isActive = selectedReport === reportKey;
                            return (
                              <button
                                key={reportKey}
                                onClick={() =>
                                  setSelectedReport(reportKey as ReportType)
                                }
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-sm transition-all duration-150 ${
                                  isActive
                                    ? "bg-indigo-600 shadow-sm"
                                    : "hover:bg-slate-50"
                                }`}>
                                <p
                                  className={`text-xs font-medium leading-tight ${
                                    isActive ? "text-white" : "text-slate-800"
                                  }`}>
                                  {report.label}
                                </p>
                                <p
                                  className={`text-xs mt-0.5 leading-tight ${
                                    isActive
                                      ? "text-indigo-200"
                                      : "text-slate-400"
                                  }`}>
                                  {report.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT — Report display */}
          <div className='lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden'>
            {/* Report header */}
            <div className='flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0'>
              <div className='flex items-center gap-3 min-w-0'>
                <div className='w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0'>
                  <Filter className='h-4 w-4 text-indigo-500' />
                </div>
                <div className='min-w-0'>
                  <p className='text-sm font-semibold text-slate-900 truncate'>
                    {REPORT_TYPES[selectedReport]?.label}
                  </p>
                  <p className='text-xs text-slate-400 truncate'>
                    {REPORT_TYPES[selectedReport]?.description}
                  </p>
                </div>
              </div>
              <button
                onClick={refetch}
                disabled={loading}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors flex-shrink-0 ml-3'>
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* Report body */}
            <div className='flex-1 overflow-auto px-5 py-4'>
              <div key={selectedReport}>{renderReportContent()}</div>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InventoryReportsSection;
