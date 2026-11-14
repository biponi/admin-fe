/**
 * Desktop product analytics — claude-themed composition (cream page,
 * stat row, category chart, health grid, inventory reports section).
 */
import { BarChartHorizontalBig } from "lucide-react";
import { PageLoader } from "@/components/loaders";
import { claude } from "../../../../lib/claude";
import { cn } from "../../../../lib/utils";
import type { StockSummaryResponse } from "../../../interface";
import type { InventoryHealthResponse } from "../../../../api/inventoryReport";
import StatCardsRow from "./StatCardsRow";
import CategoryBreakdownCard from "./CategoryBreakdownCard";
import InventoryHealthCard from "./InventoryHealthCard";
import ExportMenu, { type ExportOption } from "./ExportMenu";
import { InventoryReportsSection } from "../inventory/InventoryReportsSection";

interface DesktopProductAnalyticsProps {
  summary: StockSummaryResponse | null;
  health: InventoryHealthResponse | null;
  isLoading: boolean;
  isDownloadingReport: boolean;
  exportOptions: ExportOption[];
}

const DesktopSkeleton = () => (
  <div className={cn(claude.card, 'py-16')}>
    <PageLoader domain='analytics' text='Loading Analytics' />
  </div>
);

export const DesktopProductAnalytics = ({
  summary,
  health,
  isLoading,
  isDownloadingReport,
  exportOptions,
}: DesktopProductAnalyticsProps) => (
  <div className={cn(claude.page, "min-h-screen")}>
    <div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 space-y-5'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div className='flex items-center gap-3.5'>
          <div className='w-11 h-11 rounded-xl bg-[#D97757] flex items-center justify-center shrink-0'>
            <BarChartHorizontalBig className='h-5 w-5 text-white' />
          </div>
          <div>
            <h1 className='text-lg font-semibold text-[#141413] leading-tight'>
              Product analytics
            </h1>
            <p className='text-sm text-[#8A877D] mt-0.5'>
              Inventory and performance overview
            </p>
          </div>
        </div>

        <ExportMenu
          options={exportOptions}
          disabled={isDownloadingReport}
          isDownloading={isDownloadingReport}
        />
      </div>

      {/* Body */}
      {isLoading ? (
        <DesktopSkeleton />
      ) : (
        <>
          <StatCardsRow summary={summary} />
          <CategoryBreakdownCard summary={summary} />
          <InventoryHealthCard health={health} />

          {/* Advanced reports */}
          <div className={cn(claude.card, "p-4 md:p-5")}>
            <div className='mb-4'>
              <h2 className={claude.title}>Inventory reports</h2>
              <p className='text-xs text-[#8A877D] mt-1'>
                Detailed reports and advanced analytics
              </p>
            </div>
            <InventoryReportsSection />
          </div>
        </>
      )}
    </div>
  </div>
);

export default DesktopProductAnalytics;
