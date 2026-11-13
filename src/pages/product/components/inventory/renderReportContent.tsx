/**
 * Shared 17-case report renderer for the inventory reports section.
 * Desktop and mobile shells both call this — only the surrounding
 * chrome differs.
 */
import { Filter } from "lucide-react";
import type { BaseReportResponse } from "../../../../api/inventoryReport";
import { ReportErrorState, ReportEmptyState } from "./reportScaffold/ReportStates";
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

/**
 * Some reports return a non-array `data` payload (e.g. `{}` or an object
 * with summary-only shape) — coerce to a safe array so table components
 * can always call array methods on their rows.
 */
const asRows = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

/** Renders loading/error/empty/selected-report content. */
export const renderReportContent = ({
  selectedReport,
  label,
  data,
  loading,
  error,
  refetch,
}: {
  selectedReport: string;
  label: string;
  data: BaseReportResponse<any> | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}) => {
  if (loading) return <ReportSkeletonState />;
  if (error) return <ReportErrorState message={error} onRetry={refetch} />;
  if (!data?.data) {
    return (
      <ReportEmptyState
        icon={<Filter className='h-5 w-5' />}
        title='No data available'
        description='Unable to load report data. Please try again.'
      />
    );
  }

  const reportData = data.data;
  const rows = asRows(reportData?.data);

  switch (selectedReport) {
    case "inventory-summary":
      return (
        <InventorySummaryCards
          data={reportData?.summary as unknown as any}
        />
      );
    case "low-stock":
      return <LowStockTable data={rows} />;
    case "out-of-stock":
      return <OutOfStockTable data={rows} />;
    case "inventory-distribution":
      return <InventoryDistributionChart data={rows} />;
    case "top-selling":
      return (
        <TopSellingTable
          data={rows}
          summary={reportData?.summary}
        />
      );
    case "sales-activity":
      return <SalesActivityTable data={rows} />;
    case "return-rate":
      return (
        <ReturnRateTable
          data={rows}
          summary={reportData?.summary}
        />
      );
    case "dead-stock":
      return <DeadStockTable data={rows} />;
    case "top-rated":
      return <TopRatedTable data={rows} />;
    case "rating-distribution":
      return <RatingDistributionChart data={rows} />;
    case "discounted-products":
      return (
        <DiscountedProductsTable
          data={rows}
          summary={reportData?.summary}
        />
      );
    case "highest-discount":
      return (
        <HighestDiscountTable
          data={rows}
          summary={reportData?.summary}
        />
      );
    case "price-distribution":
      return <PriceDistributionChart data={rows} />;
    case "category-performance":
      return <CategoryPerformanceTable data={rows} />;
    case "manufacturer-report":
      return <ManufacturerReportTable data={rows} />;
    case "recently-added":
      return <RecentlyAddedTable data={rows} />;
    case "recently-updated":
      return <RecentlyUpdatedTable data={rows} />;
    default:
      return (
        <ReportEmptyState
          icon={<Filter className='h-5 w-5' />}
          title='Coming soon'
          description={`The ${label} report is being built.`}
        />
      );
  }
};

/** Full-area skeleton shown while the selected report loads. */
const ReportSkeletonState = () => (
  <div className='space-y-3'>
    <div className='grid grid-cols-2 md:grid-cols-4 gap-2.5'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='rounded-lg border border-[#E8E4DC] bg-[#FAF9F6] px-3.5 py-3 animate-pulse'>
          <div className='h-2.5 w-16 rounded bg-[#E8E4DC] mb-2.5' />
          <div className='h-5 w-12 rounded bg-[#E8E4DC]' />
        </div>
      ))}
    </div>
    <div className='rounded-lg border border-[#E8E4DC] bg-white p-4 animate-pulse space-y-2.5'>
      <div className='h-8 w-full rounded bg-[#FAF9F6]' />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='h-10 w-full rounded bg-[#FAF9F6]' />
      ))}
    </div>
  </div>
);
