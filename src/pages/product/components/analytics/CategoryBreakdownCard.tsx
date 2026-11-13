/**
 * Desktop category breakdown — horizontal bar chart of stock by category
 * (single series, coral accent, "Other" fold beyond 10) + the full
 * per-metric breakdown Sheet restyled with claude tokens.
 */
import { useMemo, useState } from "react";
import { Chart as ChartJS, type ChartData } from "chart.js";
import { BarChartHorizontalBig, ChevronRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../../components/ui/sheet";
import { SafeBar as Bar, claudeChartTheme } from "../../../../lib/claudeChart";
import { claude } from "../../../../lib/claude";
import { cn } from "../../../../lib/utils";
import type {
  CategoryStockSummary,
  StockSummaryResponse,
} from "../../../interface";
import { formatNumber } from "../../../../utils/inventoryReportUtils";

const MAX_BARS = 10;

export const CategoryBreakdownCard = ({
  summary,
}: {
  summary: StockSummaryResponse | null;
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const categories = summary?.categories ?? [];
  const totalStock =
    summary?.totals?.totalStock ?? summary?.totalStockUnits ?? 0;

  const chartData: ChartData<"bar"> | null = useMemo(() => {
    if (categories.length === 0) return null;
    const sorted = [...categories].sort(
      (a, b) => (b.totalStock as number) - (a.totalStock as number),
    );
    const kept = sorted.slice(0, MAX_BARS);
    const otherValue = sorted
      .slice(MAX_BARS)
      .reduce((sum, c) => sum + (c.totalStock as number), 0);
    const labels = kept.map((c) => c.categoryName);
    const values = kept.map((c) => c.totalStock as number);
    if (otherValue > 0) {
      labels.push("Other");
      values.push(otherValue);
    }
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((l) =>
            l === "Other" ? "#8A877D" : "#C96442",
          ),
          borderRadius: { topLeft: 0, bottomLeft: 0, topRight: 4, bottomRight: 4 },
          borderSkipped: false,
          maxBarThickness: 22,
        },
      ],
    };
  }, [categories]);

  const options = useMemo(
    () => ({
      indexAxis: "y" as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...claudeChartTheme.tooltip,
          callbacks: {
            label: (ctx: ChartJS.TooltipContext<"bar">) => {
              const pct =
                totalStock > 0
                  ? ((ctx.parsed.x as number) / totalStock) * 100
                  : 0;
              return ` ${formatNumber(ctx.parsed.x as number)} units · ${pct.toFixed(1)}%`;
            },
          },
        },
      },
      scales: {
        x: {
          ...claudeChartTheme.scales.x,
          title: {
            display: true,
            text: "Stock units",
            color: "#8A877D",
            font: { size: 11 },
          },
          beginAtZero: true,
        },
        y: {
          ...claudeChartTheme.scales.y,
          beginAtZero: false,
          grid: { display: false },
        },
      },
    }),
    [totalStock],
  );

  if (categories.length === 0) return null;

  return (
    <div className={cn(claude.card, "p-4 md:p-5")}>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
        <div>
          <h2 className={claude.title}>Category breakdown</h2>
          <p className='text-xs text-[#8A877D] mt-0.5'>
            Inventory distributed across product categories
          </p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              className={cn(claude.btnOutline, "w-full sm:w-auto")}>
              <BarChartHorizontalBig className='h-4 w-4 mr-2 text-[#8A877D]' />
              Full breakdown
              <ChevronRight className='h-4 w-4 ml-1 text-[#8A877D]' />
            </Button>
          </SheetTrigger>
          <SheetContent className='w-full md:max-w-2xl overflow-hidden'>
            <SheetHeader className='mb-5 border-b border-[#E8E4DC]'>
              <SheetTitle className='flex items-center gap-2 text-[#141413]'>
                <BarChartHorizontalBig className='h-5 w-5 text-[#D97757]' />
                Category breakdown
              </SheetTitle>
              <SheetDescription className='text-[#8A877D]'>
                Distribution of products across all categories
              </SheetDescription>
            </SheetHeader>

            <div className='space-y-7 overflow-y-auto max-h-[calc(100vh-160px)] pr-2 pb-6'>
              {buildSheetStats(summary).map(({ label, key, total }) => (
                <div key={key}>
                  <h4 className={cn(claude.microLabel, "mb-3")}>{label}</h4>
                  <div className='space-y-3'>
                    {categories.map((cat: CategoryStockSummary) => {
                      const catVal = ((cat as any)[key] as number) ?? 0;
                      const pct = total ? Math.min((catVal / total) * 100, 100) : 0;
                      return (
                        <div key={cat.categoryId} className='space-y-1.5'>
                          <div className='flex items-center justify-between gap-3'>
                            <span className='text-[13px] font-medium text-[#141413] truncate min-w-0'>
                              {cat.categoryName}
                            </span>
                            <span className='flex items-center gap-2 shrink-0'>
                              <span className='text-xs text-[#8A877D] tabular-nums'>
                                {pct.toFixed(1)}%
                              </span>
                              <span className='text-[13px] font-semibold text-[#141413] tabular-nums'>
                                {formatNumber(catVal)}
                              </span>
                            </span>
                          </div>
                          <div className='h-1.5 bg-[#F5F1EA] rounded-full overflow-hidden'>
                            <div
                              className='h-full rounded-full bg-[#C96442] transition-all duration-500'
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Chart */}
      <div className='h-80 relative'>
        {chartData && <Bar data={chartData} options={options} />}
      </div>
    </div>
  );
};

/** Per-metric totals used by the full-breakdown sheet. */
const buildSheetStats = (summary: StockSummaryResponse | null) => [
  {
    label: "Active products",
    key: "totalActiveProducts" as const,
    total: summary?.totalActiveProductType ?? 0,
  },
  {
    label: "Total stock",
    key: "totalStock" as const,
    total: summary?.totals?.totalStock ?? summary?.totalStockUnits ?? 0,
  },
  {
    label: "Variations",
    key: "totalVariants" as const,
    total: summary?.totalActiveProductVariations ?? 0,
  },
  {
    label: "Total value",
    key: "totalPrice" as const,
    total: summary?.totalActiveProductPrice ?? 0,
  },
];

export default CategoryBreakdownCard;
