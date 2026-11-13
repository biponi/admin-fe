import { Layers } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  NumberCell,
  ProgressBarCell,
  ToneBadge,
} from "../reportScaffold/reportCells";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { CategoryPerformance } from "../../../../../api/inventoryReport";

interface CategoryPerformanceTableProps {
  data: CategoryPerformance[];
}

/** Sell-through badge (units sold / stock units). */
const sellThroughBadge = (unitsSold: number, stockUnits: number) => {
  if (stockUnits === 0) return <ToneBadge tone='neutral'>N/A</ToneBadge>;
  const rate = (unitsSold / stockUnits) * 100;
  if (rate >= 70) return <ToneBadge tone='good'>Excellent</ToneBadge>;
  if (rate >= 50) return <ToneBadge tone='good'>Good</ToneBadge>;
  if (rate >= 30) return <ToneBadge tone='warn'>Moderate</ToneBadge>;
  return <ToneBadge tone='warn'>Slow</ToneBadge>;
};

/**
 * Category Performance Table — sales by category with sell-through rates.
 */
export const CategoryPerformanceTable = ({
  data,
}: CategoryPerformanceTableProps) => {
  const rows = (Array.isArray(data) ? data : []).sort((a, b) => b.unitsSold - a.unitsSold);
  const totalProducts = rows.reduce((sum, item) => sum + item.productCount, 0);
  const totalUnitsSold = rows.reduce((sum, item) => sum + item.unitsSold, 0);
  const totalStockUnits = rows.reduce((sum, item) => sum + item.stockUnits, 0);
  const maxUnitsSold = rows[0]?.unitsSold ?? 0;

  const columns: ReportColumn<CategoryPerformance>[] = [
    {
      key: "category",
      header: "Category",
      widthClass: "min-w-[160px]",
      mobileSlot: "title",
      render: (c) => (
        <span className='font-medium text-[#141413]'>{c.categoryName}</span>
      ),
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      mobileSlot: "meta",
      render: (c) => <NumberCell value={c.productCount} />,
    },
    {
      key: "sold",
      header: "Units Sold",
      align: "right",
      mobileSlot: "trailing",
      render: (c) => <NumberCell value={c.unitsSold} />,
    },
    {
      key: "share",
      header: "Share of Sales",
      widthClass: "min-w-[160px]",
      mobileSlot: "hidden",
      render: (c) => (
        <ProgressBarCell
          value={c.unitsSold}
          max={maxUnitsSold}
          label={
            totalUnitsSold > 0
              ? `${((c.unitsSold / totalUnitsSold) * 100).toFixed(1)}%`
              : "0.0%"
          }
        />
      ),
    },
    {
      key: "stock",
      header: "Stock Units",
      align: "right",
      mobileSlot: "meta",
      render: (c) => <NumberCell value={c.stockUnits} />,
    },
    {
      key: "sellThrough",
      header: "Sell-through",
      align: "center",
      render: (c) => sellThroughBadge(c.unitsSold, c.stockUnits),
    },
  ];

  return (
    <div className='space-y-3'>
      <ReportStatTiles
        tiles={[
          { label: "Categories", value: formatNumber(rows.length) },
          { label: "Total products", value: formatNumber(totalProducts) },
          {
            label: "Total units sold",
            value: formatNumber(totalUnitsSold),
            tone: "good",
          },
          { label: "Total stock units", value: formatNumber(totalStockUnits) },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(c) => c.categoryId}
        empty={{
          icon: <Layers className='h-5 w-5' />,
          title: "No Category Data",
          description: "Unable to generate category performance report",
        }}
        summary={[
          { label: "Categories", value: formatNumber(rows.length) },
          { label: "Units Sold", value: formatNumber(totalUnitsSold) },
        ]}
      />
    </div>
  );
};

export default CategoryPerformanceTable;
