import { CheckCircle2, AlertCircle } from "lucide-react";
import { ReportTable, type ReportColumn } from "../reportScaffold/ReportTable";
import { ReportStatTiles } from "../reportScaffold/ReportStatTiles";
import {
  MonoCell,
  ProductNameCell,
  RelativeTimeCell,
  ToneBadge,
} from "../reportScaffold/reportCells";
import { formatNumber } from "../../../../../utils/inventoryReportUtils";
import { DeadStockProduct } from "../../../../../api/inventoryReport";

interface DeadStockTableProps {
  data: DeadStockProduct[];
}

/** Severity tone by days since last sale (reserved status colors). */
const severityTone = (days: number) =>
  days <= 120
    ? { tone: "warn" as const, label: "Warning" }
    : days <= 180
      ? { tone: "warn" as const, label: "Urgent" }
      : { tone: "bad" as const, label: "Critical" };

const columns: ReportColumn<DeadStockProduct>[] = [
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
    key: "stock",
    header: "Stock",
    align: "right",
    mobileSlot: "trailing",
    render: (p) => (
      <span className='tabular-nums text-[#141413]'>
        {formatNumber(p.totalStock)}
      </span>
    ),
  },
  {
    key: "lastSale",
    header: "Last Sale",
    mobileSlot: "meta",
    render: (p) => <RelativeTimeCell value={p.lastSaleAt} />,
  },
  {
    key: "days",
    header: "Days Idle",
    align: "right",
    render: (p) => (
      <span className='tabular-nums text-[#141413]'>{p.daysSinceLastSale}</span>
    ),
  },
  {
    key: "severity",
    header: "Severity",
    align: "center",
    mobileSlot: "meta",
    render: (p) => {
      const { tone, label } = severityTone(p.daysSinceLastSale);
      return <ToneBadge tone={tone}>{label}</ToneBadge>;
    },
  },
];

/**
 * Dead Stock Table — products with no recent sales activity.
 */
export const DeadStockTable = ({ data }: DeadStockTableProps) => {
  const rows = Array.isArray(data) ? data : [];
  const totalDeadStock = rows.reduce((sum, p) => sum + p.totalStock, 0);
  const criticalCount = rows.filter((p) => p.daysSinceLastSale > 180).length;
  const warningCount = rows.filter(
    (p) => p.daysSinceLastSale > 120 && p.daysSinceLastSale <= 180,
  ).length;

  return (
    <div className='space-y-3'>
      {criticalCount > 0 && (
        <div className='flex items-center gap-3 rounded-lg border border-[#F2D2DC] bg-[#FBEFF3] p-3.5'>
          <AlertCircle className='h-5 w-5 shrink-0 text-[#B3365B]' />
          <div className='min-w-0'>
            <p className='text-sm font-semibold text-[#141413]'>
              {criticalCount} product{criticalCount > 1 ? "s" : ""} with critical
              dead stock (6+ months)
            </p>
            <p className='text-xs text-[#57554D] mt-0.5'>
              Consider discounting or liquidating these items
            </p>
          </div>
        </div>
      )}
      <ReportStatTiles
        tiles={[
          {
            label: "Critical items",
            value: criticalCount,
            sub: "6+ months idle",
            tone: "bad",
          },
          {
            label: "Warning items",
            value: warningCount,
            sub: "4–6 months idle",
            tone: "warn",
          },
          {
            label: "Total dead stock",
            value: formatNumber(totalDeadStock),
            sub: "units",
            tone: "neutral",
          },
          { label: "Products listed", value: rows.length, tone: "neutral" },
        ]}
      />
      <ReportTable
        columns={columns}
        rows={rows}
        rowKey={(_, i) => i}
        empty={{
          icon: <CheckCircle2 className='h-5 w-5 text-[#1A7F37]' />,
          title: "No Dead Stock",
          description: "All products have recent sales activity",
        }}
        summary={[{ label: "Products Listed", value: rows.length }]}
      />
    </div>
  );
};

export default DeadStockTable;
