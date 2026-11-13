import { Factory } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import { NumberCell, ProgressBarCell, ToneBadge } from "../reportScaffold/reportCells";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { ManufacturerReport } from "../../../../../api/inventoryReport";

interface ManufacturerReportTableProps {
  data: ManufacturerReport[];
}

/** Sales-per-product tier badge. */
const tierBadge = (productCount: number, unitsSold: number) => {
  if (productCount === 0) return <ToneBadge tone='neutral'>N/A</ToneBadge>;
  const avg = unitsSold / productCount;
  if (avg >= 100) return <ToneBadge tone='good'>Excellent</ToneBadge>;
  if (avg >= 50) return <ToneBadge tone='good'>Good</ToneBadge>;
  if (avg >= 20) return <ToneBadge tone='warn'>Moderate</ToneBadge>;
  return <ToneBadge tone='warn'>Low</ToneBadge>;
};

/**
 * Manufacturer Report Table — sales by manufacturer.
 */
export const ManufacturerReportTable = ({
  data,
}: ManufacturerReportTableProps) => {
  const rows = (Array.isArray(data) ? data : []).sort((a, b) => b.unitsSold - a.unitsSold);
  const totalProducts = rows.reduce((sum, item) => sum + item.productCount, 0);
  const totalUnitsSold = rows.reduce((sum, item) => sum + item.unitsSold, 0);
  const maxUnitsSold = rows[0]?.unitsSold ?? 0;

  const columns: ReportColumn<ManufacturerReport>[] = [
    {
      key: "rank",
      header: "Rank",
      align: "center",
      mobileSlot: "hidden",
      render: (_, i) => (
        <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F1EA] text-[#57554D] text-xs font-semibold'>
          {i + 1}
        </span>
      ),
    },
    {
      key: "manufacturer",
      header: "Manufacturer",
      widthClass: "min-w-[160px]",
      mobileSlot: "title",
      render: (m) => (
        <span className='font-medium text-[#141413]'>{m.manufacturer}</span>
      ),
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      mobileSlot: "meta",
      render: (m) => <NumberCell value={m.productCount} />,
    },
    {
      key: "sold",
      header: "Units Sold",
      align: "right",
      mobileSlot: "trailing",
      render: (m) => <NumberCell value={m.unitsSold} />,
    },
    {
      key: "share",
      header: "Share of Sales",
      widthClass: "min-w-[160px]",
      mobileSlot: "hidden",
      render: (m) => (
        <ProgressBarCell
          value={m.unitsSold}
          max={maxUnitsSold}
          label={
            totalUnitsSold > 0
              ? `${((m.unitsSold / totalUnitsSold) * 100).toFixed(1)}%`
              : "0.0%"
          }
        />
      ),
    },
    {
      key: "tier",
      header: "Sales Tier",
      align: "center",
      render: (m) => tierBadge(m.productCount, m.unitsSold),
    },
  ];

  return (
    <div className='space-y-3'>
      <ReportStatTiles
        tiles={[
          { label: "Manufacturers", value: formatNumber(rows.length) },
          { label: "Total products", value: formatNumber(totalProducts) },
          {
            label: "Total units sold",
            value: formatNumber(totalUnitsSold),
            tone: "good",
          },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(m, i) => `${m.manufacturer}-${i}`}
        empty={{
          icon: <Factory className='h-5 w-5' />,
          title: "No Manufacturer Data",
          description: "Unable to generate manufacturer report",
        }}
        summary={[
          { label: "Manufacturers", value: formatNumber(rows.length) },
          { label: "Units Sold", value: formatNumber(totalUnitsSold) },
        ]}
      />
    </div>
  );
};

export default ManufacturerReportTable;
