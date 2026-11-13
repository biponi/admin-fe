/**
 * Mobile product analytics — Material tree behind a useIsMobile() branch
 * (pattern: AuditDashboard). Data is fetched once by the page and passed
 * down; handlers come in as props.
 */
import { useState } from "react";
import {
  BarChartHorizontalBig,
  Download,
  HeartPulse,
  Package,
} from "lucide-react";
import {
  MobilePage,
  MobileStatRow,
  MobileStatTile,
  MobileListCard,
  MobileStaggeredList,
  MobileSkeletonList,
  MobileDetailSheet,
  MobileActionSheet,
  type MobileSheetAction,
} from "../../../../../components/mobile";
import { Button } from "../../../../../components/ui/button";
import { Progress } from "../../../../../components/ui/progress";
import type {
  CategoryStockSummary,
  StockSummaryResponse,
} from "../../../interface";
import type { InventoryHealthResponse } from "../../../../../api/inventoryReport";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import {
  buildStatsData,
  buildHealthMetrics,
  formatStatValue,
} from "../analyticsConfig";
import { MobileInventoryReports } from "../../inventory/mobile/MobileInventoryReports";

const toneClasses = {
  good: "bg-[#EBF7EE] text-[#1A7F37]",
  warn: "bg-[#FBF3D8] text-[#8A6A00]",
  bad: "bg-[#FBEFF3] text-[#B3365B]",
  neutral: "bg-muted text-muted-foreground",
} as const;

interface MobileProductAnalyticsProps {
  summary: StockSummaryResponse | null;
  health: InventoryHealthResponse | null;
  isLoading: boolean;
  isDownloadingReport: boolean;
  exportActions: {
    download: () => Promise<any>;
    name: string;
    format: string;
  }[];
}

export const MobileProductAnalytics = ({
  summary,
  health,
  isLoading,
  isDownloadingReport,
  exportActions,
}: MobileProductAnalyticsProps) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const statsData = buildStatsData(summary);
  const healthMetrics = buildHealthMetrics(health);
  const categories = summary?.categories ?? [];
  const totalStock = summary?.totals?.totalStock ?? summary?.totalStockUnits ?? 0;

  const sheetActions: MobileSheetAction[] = exportActions.map((a) => ({
    label: `${a.name} (${a.format})`,
    disabled: isDownloadingReport,
    onClick: () => {
      setExportOpen(false);
      a.download();
    },
  }));

  return (
    <MobilePage
      title='Product Analytics'
      subtitle='Inventory and performance overview'
      actions={
        <Button
          variant='ghost'
          size='icon'
          className='h-10 w-10 rounded-full'
          onClick={() => setExportOpen(true)}
          disabled={isDownloadingReport}
          aria-label='Export report'>
          <Download className='h-5 w-5' />
        </Button>
      }>
      {/* Export action sheet */}
      <MobileActionSheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        title='Export product report'
        description={isDownloadingReport ? "Preparing download…" : undefined}
        actions={sheetActions}
      />

      {isLoading ? (
        <div className='px-4 pt-4 space-y-3'>
          <MobileSkeletonList count={5} />
        </div>
      ) : (
        <div className='px-4 pt-4 space-y-5'>
          {/* Stats */}
          <MobileStatRow>
            {statsData.map((stat) => (
              <MobileStatTile
                key={stat.key}
                label={stat.label}
                value={formatStatValue(stat)}
                icon={stat.icon}
              />
            ))}
          </MobileStatRow>

          {/* Category breakdown */}
          <section className='space-y-2.5'>
            <div className='flex items-center justify-between'>
              <h2 className='flex items-center gap-1.5 text-sm font-semibold'>
                <BarChartHorizontalBig className='h-4 w-4 text-[#D97757]' />
                Category breakdown
              </h2>
              {categories.length > 0 && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 text-xs text-[#9A4B2E]'
                  onClick={() => setBreakdownOpen(true)}>
                  View all
                </Button>
              )}
            </div>
            {categories.length === 0 ? (
              <p className='text-[13px] text-muted-foreground py-4 text-center'>
                No category data available
              </p>
            ) : (
              <MobileStaggeredList>
                {categories.slice(0, 5).map((cat: CategoryStockSummary) => {
                  const pct =
                    totalStock > 0
                      ? Math.min(((cat.totalStock as number) / totalStock) * 100, 100)
                      : 0;
                  return (
                    <MobileListCard
                      key={cat.categoryId}
                      title={cat.categoryName}
                      trailing={
                        <span className='text-[13px] font-semibold tabular-nums'>
                          {formatNumber(cat.totalStock as number)}
                        </span>
                      }>
                      <div className='flex items-center gap-2'>
                        <Progress value={pct} className='h-1.5 flex-1' />
                        <span className='text-[11px] text-muted-foreground tabular-nums shrink-0'>
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </MobileListCard>
                  );
                })}
              </MobileStaggeredList>
            )}
          </section>

          {/* Inventory health */}
          <section className='space-y-2.5'>
            <h2 className='flex items-center gap-1.5 text-sm font-semibold'>
              <HeartPulse className='h-4 w-4 text-[#D97757]' />
              Inventory health
            </h2>
            {healthMetrics.length === 0 ? (
              <div className='rounded-2xl border bg-card p-4 animate-pulse space-y-2'>
                <div className='h-3 w-24 rounded bg-muted' />
                <div className='h-6 w-16 rounded bg-muted' />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-2.5'>
                {healthMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className='flex min-w-0 flex-col gap-1.5 rounded-2xl border bg-card px-4 py-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground truncate'>
                        {metric.label}
                      </span>
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${toneClasses[metric.tone]}`}>
                        {metric.icon}
                      </span>
                    </div>
                    <span className='text-lg font-semibold leading-none tabular-nums'>
                      {formatNumber(metric.value)}
                    </span>
                    <span className='text-[11px] text-muted-foreground'>
                      {metric.badgeText}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Advanced inventory reports */}
          <section className='space-y-2.5'>
            <h2 className='flex items-center gap-1.5 text-sm font-semibold'>
              <Package className='h-4 w-4 text-[#D97757]' />
              Reports
            </h2>
            <MobileInventoryReports />
          </section>
        </div>
      )}

      {/* Full category breakdown sheet */}
      <MobileDetailSheet
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
        title='Category breakdown'
        description='Distribution of products across all categories'>
        <div className='space-y-5'>
          {statsData.map(({ label, key }) => (
            <div key={String(key)}>
              <h4 className='text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5'>
                {label}
              </h4>
              <div className='space-y-3'>
                {(summary?.categories ?? []).map((cat: CategoryStockSummary) => {
                  const stat = statsData.find((s) => s.key === key);
                  const total = stat?.value ?? 0;
                  const catVal = ((cat as any)[key] as number) ?? 0;
                  const pct = total ? Math.min((catVal / total) * 100, 100) : 0;
                  return (
                    <div key={cat.categoryId} className='space-y-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <span className='text-[13px] font-medium truncate'>
                          {cat.categoryName}
                        </span>
                        <span className='text-[13px] font-semibold tabular-nums shrink-0'>
                          {formatNumber(catVal)}
                          <span className='ml-1.5 text-[11px] font-normal text-muted-foreground'>
                            {pct.toFixed(1)}%
                          </span>
                        </span>
                      </div>
                      <Progress value={pct} className='h-1.5' />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </MobileDetailSheet>
    </MobilePage>
  );
};

export default MobileProductAnalytics;
