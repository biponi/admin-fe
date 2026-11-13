import { Trophy, TrendingUp } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  CurrencyCell,
  MonoCell,
  NumberCell,
  ProgressBarCell,
  ProductNameCell,
  ActiveBadgeCell,
  ToneBadge,
} from "../reportScaffold/reportCells";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { TopSellingProduct } from "../../../../../api/inventoryReport";

interface TopSellingTableProps {
  data: TopSellingProduct[];
  /** Server-computed totals over the WHOLE dataset, not just this page */
  summary?: Record<string, any>;
}

const RankBadge = ({ rank }: { rank: number }) =>
  rank <= 3 ? (
    <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#C96442] text-white text-xs font-bold'>
      {rank}
    </span>
  ) : (
    <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F1EA] text-[#57554D] text-xs font-semibold'>
      {rank}
    </span>
  );

/**
 * Top Selling Products Table — best-performing products with ranking.
 */
export const TopSellingTable = ({ data, summary }: TopSellingTableProps) => {
  const rows = Array.isArray(data) ? data : [];
  // Prefer server-side totals (whole dataset); fall back to page sum
  const totalSales =
    summary?.totalUnitsSold ?? rows.reduce((sum, p) => sum + p.totalSold, 0);
  const totalRevenue = summary?.totalNetRevenue;
  const period = summary?.period;
  const topSold = rows[0]?.totalSold ?? 0;
  const hasStock = rows.some((p) => p.totalStock !== undefined);

  const columns: ReportColumn<TopSellingProduct>[] = [
    {
      key: "rank",
      header: "Rank",
      align: "center",
      mobileSlot: "hidden",
      render: (_, i) => <RankBadge rank={i + 1} />,
    },
    {
      key: "name",
      header: "Product",
      widthClass: "min-w-[200px]",
      mobileSlot: "title",
      render: (p) => <ProductNameCell name={p.name} />,
    },
    {
      key: "sku",
      header: "SKU",
      mobileSlot: "meta",
      render: (p) => <MonoCell value={p.sku} />,
    },
    {
      key: "sold",
      header: "Units Sold",
      align: "right",
      mobileSlot: "trailing",
      render: (p) => <NumberCell value={p.totalSold} />,
    },
    {
      key: "share",
      header: "Share of Sales",
      widthClass: "min-w-[160px]",
      mobileSlot: "hidden",
      render: (p) => (
        <ProgressBarCell
          value={p.totalSold}
          max={topSold}
          label={
            totalSales > 0
              ? `${((p.totalSold / totalSales) * 100).toFixed(1)}%`
              : "0.0%"
          }
        />
      ),
    },
    {
      key: "revenue",
      header: "Net Revenue",
      align: "right",
      mobileSlot: "meta",
      render: (p) => <CurrencyCell value={p.netRevenue ?? 0} />,
    },
    ...(hasStock
      ? [
          {
            key: "stock",
            header: "In Stock",
            align: "center" as const,
            mobileSlot: "hidden" as const,
            render: (p: TopSellingProduct) => (
              <ToneBadge
                tone={
                  (p.totalStock ?? 0) > 10
                    ? "good"
                    : (p.totalStock ?? 0) > 0
                      ? "warn"
                      : "bad"
                }>
                {formatNumber(p.totalStock ?? 0)}
              </ToneBadge>
            ),
          },
        ]
      : []),
    {
      key: "status",
      header: "Status",
      align: "center",
      mobileSlot: "hidden",
      render: (p) => <ActiveBadgeCell active={p.active} />,
    },
  ];

  return (
    <div className='space-y-3'>
      {period?.type === "range" && (
        <p className='text-xs text-[#8A877D]'>
          Showing {new Date(period.startDate).toLocaleDateString()} –{" "}
          {new Date(period.endDate).toLocaleDateString()} · switch to all-time by
          clearing the date filters
        </p>
      )}
      <ReportStatTiles
        tiles={[
          {
            label: "Top product sales",
            value: `${formatNumber(topSold)} units`,
            tone: "warn",
            icon: <Trophy className='h-3.5 w-3.5' />,
          },
          { label: "Products listed", value: rows.length },
          {
            label: "Total units sold",
            value: formatNumber(totalSales),
            tone: "good",
            icon: <TrendingUp className='h-3.5 w-3.5' />,
          },
          ...(totalRevenue !== undefined
            ? [
                {
                  label: "Total net revenue",
                  value: formatNumber(totalRevenue),
                  sub: "৳ across the period",
                },
              ]
            : []),
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <TrendingUp className='h-5 w-5' />,
          title: "No Sales Data",
          description: "No products have been sold yet",
        }}
        summary={[
          { label: "Top Seller", value: rows[0]?.name ?? "—" },
          {
            label: "Market Share",
            value:
              totalSales > 0
                ? `${((topSold / totalSales) * 100).toFixed(1)}%`
                : "0.0%",
          },
        ]}
      />
    </div>
  );
};

export default TopSellingTable;
